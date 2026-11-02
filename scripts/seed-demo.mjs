// DEMO catalog seeder for client design review.
//   npm run seed:demo     → adds demo categories + products (idempotent; existing SKUs/slugs are skipped)
//   npm run demo:remove   → deletes demo products (and their Cloudinary images) and demo categories
// Safety: only documents with isDemo: true are ever modified or deleted. Real products,
// customers and orders are never touched (test orders keep their own item snapshots).
import sharp from 'sharp';
import { connectDB, disconnectDB } from '../src/server/db/connect.js';
import * as models from '../src/server/models/index.js';
import { optimizeToWebp } from '../src/server/media/optimizeImage.js';
import { destroyImages, uploadWebp } from '../src/server/media/cloudinary.js';
import { effectivePrice } from '../src/lib/utils/pricing.js';
import { slugify } from '../src/lib/utils/format.js';
import { demoCategories, demoProducts } from './demo/catalog.mjs';
import { renderProductSvg } from './demo/illustrations.mjs';

const { Category, Product, Order, User, Media } = models;
const DEMO_FOLDER = `${(process.env.CLOUDINARY_FOLDER || 'zeoton/products').split('/')[0]}/demo`;

async function snapshotRealData() {
  return {
    realProducts: await Product.countDocuments({ isDemo: { $ne: true } }),
    customers: await User.countDocuments({ role: 'customer' }),
    orders: await Order.countDocuments(),
  };
}

function sellPriceOf(p) {
  if (p.variants?.length) {
    return Math.min(...p.variants.map((v) => (v.price != null ? effectivePrice(v.price, v.salePrice) : effectivePrice(p.price, v.salePrice ?? p.salePrice))));
  }
  return effectivePrice(p.price, p.salePrice);
}

async function renderAndUpload(spec, alt) {
  const png = await sharp(Buffer.from(renderProductSvg(spec))).png().toBuffer();
  const result = await optimizeToWebp(png); // same optimizer as admin uploads (WebP, 250 KB target)
  if (!result.ok) throw new Error(`Demo image above target (${result.bytes} bytes)`);
  const uploaded = await uploadWebp(result.buffer, { folder: DEMO_FOLDER });
  await Media.create({ ...uploaded, originalBytes: result.originalBytes, originalFormat: result.originalFormat, quality: result.quality, withinTarget: true, folder: DEMO_FOLDER });
  return { ...uploaded, alt };
}

async function seedCategories() {
  const created = [];
  const kept = [];
  for (const c of demoCategories) {
    const existing = await Category.findOne({ slug: c.slug }).lean();
    if (existing) {
      kept.push(c.slug);
      continue;
    }
    let parent = null;
    if (c.parentSlug) {
      parent = await Category.findOne({ slug: c.parentSlug }).select('_id').lean();
      if (!parent) throw new Error(`Parent category "${c.parentSlug}" not found. Run npm run seed first.`);
    }
    await Category.create({
      name: c.name,
      slug: c.slug,
      parent: parent?._id || null,
      description: c.description,
      seo: c.seo,
      sortOrder: c.sortOrder,
      isActive: true,
      isDemo: true,
    });
    created.push(c.slug);
  }
  return { created, kept };
}

async function seedProducts() {
  const slugs = new Map((await Category.find().select('slug').lean()).map((c) => [c.slug, c._id]));
  const created = [];
  const skipped = [];

  for (const p of demoProducts) {
    const slug = slugify(p.name);
    const skus = [p.sku, ...(p.variants || []).map((v) => v.sku)];
    if (await Product.exists({ $or: [{ sku: p.sku }, { slug }, { 'variants.sku': { $in: skus } }] })) {
      skipped.push(p.sku);
      continue;
    }
    const category = slugs.get(p.category);
    if (!category) throw new Error(`Category "${p.category}" not found for ${p.sku}`);

    const images = [];
    try {
      images.push(await renderAndUpload({ ...p.art, view: 'main' }, `${p.name} — demo illustration`));
      images.push(await renderAndUpload({ ...(p.artAlt || p.art), view: 'alt' }, `${p.name} — demo illustration, alternate view`));

      const doc = {
        name: p.name,
        slug,
        sku: p.sku,
        category,
        subcategory: p.subcategory ? slugs.get(p.subcategory) || null : null,
        brand: p.brand,
        shortDescription: p.shortDescription,
        description: p.description,
        specs: p.specs.map(([label, value]) => ({ label, value })),
        images,
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.variants?.length ? 0 : p.stock ?? 0,
        variants: (p.variants || []).map((v) => ({ label: v.label, sku: v.sku, price: v.price ?? null, salePrice: v.salePrice ?? null, stock: v.stock })),
        tags: p.tags || [],
        isActive: true,
        isFeatured: !!p.isFeatured,
        isDemo: true,
      };
      doc.sellPrice = sellPriceOf(doc);
      await Product.create(doc);
      created.push(p.sku);
      process.stdout.write(`  + ${p.sku} ${p.name}\n`);
    } catch (err) {
      // Never leave orphaned images behind.
      if (images.length) await destroyImages(images.map((i) => i.publicId));
      throw new Error(`${p.sku}: ${err.message}`);
    }
  }
  return { created, skipped };
}

async function removeDemo() {
  const products = await Product.find({ isDemo: true }).select('images').lean();
  for (const p of products) {
    await Product.deleteOne({ _id: p._id, isDemo: true });
    if (p.images?.length) await destroyImages(p.images.map((i) => i.publicId));
  }

  // Subcategories first, then top-level. A demo category still used by a real product is kept (and un-flagged).
  const cats = await Category.find({ isDemo: true }).select('slug parent').lean();
  const ordered = [...cats.filter((c) => c.parent), ...cats.filter((c) => !c.parent)];
  const deleted = [];
  const keptInUse = [];
  for (const c of ordered) {
    const inUse = await Product.exists({ $or: [{ category: c._id }, { subcategory: c._id }] });
    const hasChildren = await Category.exists({ parent: c._id });
    if (inUse || hasChildren) {
      await Category.updateOne({ _id: c._id }, { $set: { isDemo: false } });
      keptInUse.push(c.slug);
    } else {
      await Category.deleteOne({ _id: c._id, isDemo: true });
      deleted.push(c.slug);
    }
  }
  return { productsDeleted: products.length, categoriesDeleted: deleted, categoriesKeptBecauseInUse: keptInUse };
}

async function main() {
  const remove = process.argv.includes('--remove');
  await connectDB();
  await Promise.all(Object.values(models).filter((m) => typeof m?.createIndexes === 'function').map((m) => m.createIndexes()));
  const before = await snapshotRealData();

  if (remove) {
    console.log('Removing demo catalog…');
    console.log(JSON.stringify(await removeDemo(), null, 2));
  } else {
    console.log('Seeding demo catalog…');
    const categories = await seedCategories();
    const products = await seedProducts();
    console.log(JSON.stringify({ categoriesCreated: categories.created.length, categoriesAlreadyPresent: categories.kept.length, productsCreated: products.created.length, productsSkipped: products.skipped.length }, null, 2));
  }

  const after = await snapshotRealData();
  const verification = {
    demoCategories: await Category.countDocuments({ isDemo: true }),
    demoProducts: await Product.countDocuments({ isDemo: true }),
    demoImages: (await Product.aggregate([{ $match: { isDemo: true } }, { $project: { n: { $size: '$images' } } }, { $group: { _id: null, n: { $sum: '$n' } } }]))[0]?.n || 0,
    realDataBefore: before,
    realDataAfter: after,
  };
  console.log('Verification:', JSON.stringify(verification, null, 2));
  // The seeder never deletes real data; counts may only grow (e.g. a shopper ordering while it runs).
  for (const key of Object.keys(before)) {
    if (after[key] < before[key]) throw new Error(`Real ${key} decreased (${before[key]} → ${after[key]}) — investigate!`);
  }
}

main()
  .then(() => disconnectDB())
  .catch(async (err) => {
    console.error('Demo seed failed:', err.message);
    await disconnectDB();
    process.exit(1);
  });
