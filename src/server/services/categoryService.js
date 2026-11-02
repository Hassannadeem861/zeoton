import 'server-only';
import { cache } from 'react';
import { connectDB } from '@/server/db/connect';
import { Category, Product } from '@/server/models';
import { HttpError, conflict, notFound } from '@/server/http/errors';
import { slugify } from '@/lib/utils/format';
import { plain } from '@/server/utils';

async function productCounts(match = { isActive: true }) {
  const rows = await Product.aggregate([
    { $match: match },
    { $project: { cats: { $setUnion: [['$category'], { $cond: [{ $ifNull: ['$subcategory', false] }, ['$subcategory'], []] }] } } },
    { $unwind: '$cats' },
    { $group: { _id: '$cats', count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
}

/** Active categories with active product counts (storefront). */
export const listActiveCategories = cache(async () => {
  await connectDB();
  const [cats, counts, realCounts] = await Promise.all([
    Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    productCounts(),
    productCounts({ isActive: true, isDemo: { $ne: true } }),
  ]);
  // productCount drives the UI; realProductCount (excludes demo) drives indexing and the sitemap.
  return plain(cats.map((c) => ({ ...c, productCount: counts.get(String(c._id)) || 0, realProductCount: realCounts.get(String(c._id)) || 0 })));
});

export const getCategoryBySlug = cache(async (slug) => {
  await connectDB();
  const cat = await Category.findOne({ slug, isActive: true }).lean();
  if (!cat) return null;
  const children = await Category.find({ parent: cat._id, isActive: true }).sort({ sortOrder: 1 }).lean();
  const parent = cat.parent ? await Category.findById(cat.parent).select('name slug').lean() : null;
  return plain({ ...cat, children, parentCategory: parent });
});

// ---------- Admin ----------

export async function adminListCategories() {
  const [cats, counts] = await Promise.all([
    Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
    productCounts({}),
  ]);
  return plain(cats.map((c) => ({ ...c, productCount: counts.get(String(c._id)) || 0 })));
}

async function assertValidParent(parentId, selfId) {
  if (!parentId) return;
  if (selfId && String(parentId) === String(selfId)) throw new HttpError(400, 'A category cannot be its own parent.');
  const parent = await Category.findById(parentId).select('parent').lean();
  if (!parent) throw new HttpError(400, 'Parent category not found.');
  if (parent.parent) throw new HttpError(400, 'Only two levels are supported (category → subcategory).');
}

export async function createCategory(input) {
  const slug = input.slug || slugify(input.name);
  if (await Category.exists({ slug })) throw conflict('A category with this slug already exists.');
  await assertValidParent(input.parent);
  const cat = await Category.create({ ...input, slug, parent: input.parent || null });
  return plain(cat.toObject());
}

export async function updateCategory(id, input) {
  const cat = await Category.findById(id);
  if (!cat) throw notFound('Category not found.');
  const slug = input.slug || slugify(input.name);
  if (slug !== cat.slug && (await Category.exists({ slug }))) throw conflict('A category with this slug already exists.');
  await assertValidParent(input.parent, id);
  if (input.parent && (await Category.exists({ parent: id }))) {
    throw new HttpError(400, 'This category has subcategories, so it cannot become a subcategory itself.');
  }
  cat.set({ ...input, slug, parent: input.parent || null });
  await cat.save();
  return plain(cat.toObject());
}

export async function deleteCategory(id) {
  const [inUse, hasChildren] = await Promise.all([
    Product.exists({ $or: [{ category: id }, { subcategory: id }] }),
    Category.exists({ parent: id }),
  ]);
  if (inUse) throw conflict('This category still has products. Move or delete them first, or deactivate the category.');
  if (hasChildren) throw conflict('Delete or move its subcategories first.');
  const res = await Category.deleteOne({ _id: id });
  if (!res.deletedCount) throw notFound('Category not found.');
  return { ok: true };
}
