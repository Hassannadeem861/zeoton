// Idempotent database seed: categories + initial admin. Safe to run repeatedly.
// - Upserts categories by slug; never overwrites fields an admin may have edited.
// - Creates the admin only if no user with SEED_ADMIN_EMAIL exists; never resets passwords.
// - Never deletes data and never touches customers, orders or products.
// Run: npm run seed
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../src/server/db/connect.js';
import * as models from '../src/server/models/index.js';
import { User, Category, Product, Order } from '../src/server/models/index.js';
import { defaultCategories } from '../src/server/catalog/defaultCategories.js';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

async function seedCategories() {
  const ops = defaultCategories.map((c) => ({
    updateOne: {
      filter: { slug: c.slug },
      update: { $setOnInsert: { ...c, isActive: true, parent: null } },
      upsert: true,
    },
  }));
  const res = await Category.bulkWrite(ops, { ordered: false });
  return { inserted: res.upsertedCount, alreadyPresent: defaultCategories.length - res.upsertedCount };
}

async function seedAdmin() {
  const email = requireEnv('SEED_ADMIN_EMAIL').toLowerCase().trim();
  const password = requireEnv('SEED_ADMIN_PASSWORD');
  if (password.length < 12) throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters');

  const existing = await User.findOne({ email }).select('+passwordHash role');
  if (existing) {
    if (existing.role !== 'admin') {
      throw new Error(`User ${email} exists but is not an admin. Refusing to change an existing account's role.`);
    }
    return { created: false, email };
  }
  await User.create({
    name: process.env.SEED_ADMIN_NAME || 'ZEOTON Admin',
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'admin',
  });
  return { created: true, email };
}

async function main() {
  await connectDB();
  // Create missing unique/TTL indexes (additive only; existing indexes are never dropped).
  await Promise.all(Object.values(models).filter((m) => typeof m?.createIndexes === 'function').map((m) => m.createIndexes()));

  const categories = await seedCategories();
  const admin = await seedAdmin();

  const verification = {
    categories: await Category.countDocuments(),
    seededCategoriesPresent: await Category.countDocuments({ slug: { $in: defaultCategories.map((c) => c.slug) } }),
    admins: await User.countDocuments({ role: 'admin' }),
    customers: await User.countDocuments({ role: 'customer' }),
    products: await Product.countDocuments(),
    orders: await Order.countDocuments(),
  };

  console.log('Seed result:', JSON.stringify({ categories, admin: { created: admin.created } }, null, 2));
  console.log('Verification:', JSON.stringify(verification, null, 2));

  if (verification.seededCategoriesPresent !== defaultCategories.length || verification.admins < 1) {
    throw new Error('Seed verification failed');
  }
}

main()
  .then(() => disconnectDB())
  .catch(async (err) => {
    console.error('Seed failed:', err.message);
    await disconnectDB();
    process.exit(1);
  });
