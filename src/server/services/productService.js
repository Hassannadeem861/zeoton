import 'server-only';
import mongoose from 'mongoose';
import { cache } from 'react';
import { connectDB } from '@/server/db/connect';
import { Category, Order, Product } from '@/server/models';
import { conflict, notFound } from '@/server/http/errors';
import { effectivePrice, resolveOffer, totalStock } from '@/lib/utils/pricing';
import { slugify } from '@/lib/utils/format';
import { escapeRegex, plain } from '@/server/utils';
import { destroyImages } from '@/server/media/cloudinary';

export const PAGE_SIZE = 24;

const CARD_FIELDS =
  'name slug brand price salePrice sellPrice stock images variants.price variants.salePrice variants.stock category isFeatured isDemo createdAt shortDescription';

export function toCard(p) {
  const hasVariants = (p.variants?.length || 0) > 0;
  const offer = resolveOffer(p);
  return {
    id: String(p._id),
    name: p.name,
    slug: p.slug,
    brand: p.brand || '',
    price: hasVariants ? p.sellPrice : offer.price,
    salePrice: hasVariants ? null : offer.salePrice,
    unitPrice: hasVariants ? p.sellPrice : offer.unitPrice,
    fromPrice: hasVariants && new Set(p.variants.map((v) => resolveOffer(p, v).unitPrice)).size > 1,
    image: p.images?.[0] ? { url: p.images[0].url, alt: p.images[0].alt || p.name, width: p.images[0].width, height: p.images[0].height } : null,
    inStock: totalStock(p) > 0,
    hasVariants,
    isFeatured: !!p.isFeatured,
    isDemo: !!p.isDemo,
    shortDescription: p.shortDescription || '',
  };
}

function computeSellPrice(input) {
  if (input.variants?.length) {
    return Math.min(
      ...input.variants.map((v) =>
        v.price != null ? effectivePrice(v.price, v.salePrice) : effectivePrice(input.price, v.salePrice ?? input.salePrice),
      ),
    );
  }
  return effectivePrice(input.price, input.salePrice);
}

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  'price-asc': { sellPrice: 1, _id: 1 },
  'price-desc': { sellPrice: -1, _id: -1 },
  popular: { soldCount: -1, createdAt: -1 },
  name: { name: 1 },
};

export function buildProductFilter({ categoryIds, q, minPrice, maxPrice, brands, inStock }) {
  const filter = { isActive: true };
  if (categoryIds?.length) filter.$or = [{ category: { $in: categoryIds } }, { subcategory: { $in: categoryIds } }];
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim().slice(0, 80)), 'i');
    filter.$and = [{ $or: [{ name: rx }, { brand: rx }, { tags: rx }, { sku: rx }] }];
  }
  if (minPrice != null || maxPrice != null) {
    filter.sellPrice = {};
    if (minPrice != null) filter.sellPrice.$gte = minPrice;
    if (maxPrice != null) filter.sellPrice.$lte = maxPrice;
  }
  if (brands?.length) filter.brand = { $in: brands };
  if (inStock) {
    filter.$and = [...(filter.$and || []), { $or: [{ stock: { $gt: 0 } }, { 'variants.stock': { $gt: 0 } }] }];
  }
  return filter;
}

/** Storefront listing with filters, sorting and pagination. */
export async function listProducts({ page = 1, limit = PAGE_SIZE, sort = 'newest', ...filters } = {}) {
  await connectDB();
  const filter = buildProductFilter(filters);
  const [items, total] = await Promise.all([
    Product.find(filter)
      .select(CARD_FIELDS)
      .sort(SORTS[sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { items: items.map(toCard), total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Facets (brands and price range) for the current category scope. */
export async function getListingFacets({ categoryIds } = {}) {
  await connectDB();
  const base = buildProductFilter({ categoryIds });
  const [brands, range] = await Promise.all([
    Product.distinct('brand', { ...base, brand: { $nin: [null, ''] } }),
    Product.aggregate([{ $match: base }, { $group: { _id: null, min: { $min: '$sellPrice' }, max: { $max: '$sellPrice' } } }]),
  ]);
  return { brands: brands.sort(), minPrice: range[0]?.min ?? 0, maxPrice: range[0]?.max ?? 0 };
}

export const getProductBySlug = cache(async (slug) => {
  await connectDB();
  const p = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .lean();
  return p ? plain(p) : null;
});

export async function getRelatedProducts(product, limit = 8) {
  await connectDB();
  const categoryId = product.category?._id || product.category;
  const items = await Product.find({ isActive: true, category: categoryId, _id: { $ne: product._id } })
    .select(CARD_FIELDS)
    .sort({ isFeatured: -1, soldCount: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  return items.map(toCard);
}

export async function getFeaturedProducts(limit = 8) {
  await connectDB();
  const items = await Product.find({ isActive: true, isFeatured: true }).select(CARD_FIELDS).sort({ updatedAt: -1 }).limit(limit).lean();
  return items.map(toCard);
}

export async function getNewArrivals(limit = 8) {
  await connectDB();
  const items = await Product.find({ isActive: true }).select(CARD_FIELDS).sort({ createdAt: -1 }).limit(limit).lean();
  return items.map(toCard);
}

/** Best sellers from real delivered units only. Empty until sales exist. */
export async function getBestSellers(limit = 8) {
  await connectDB();
  const items = await Product.find({ isActive: true, soldCount: { $gt: 0 } }).select(CARD_FIELDS).sort({ soldCount: -1 }).limit(limit).lean();
  return items.map(toCard);
}

/** Trending = most ordered (non-cancelled) in the last 30 days, from real orders. */
export async function getTrendingProducts(limit = 8) {
  await connectDB();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', qty: { $sum: '$items.quantity' } } },
    { $sort: { qty: -1 } },
    { $limit: limit * 2 },
  ]);
  if (!rows.length) return [];
  const products = await Product.find({ _id: { $in: rows.map((r) => r._id) }, isActive: true }).select(CARD_FIELDS).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return rows.map((r) => byId.get(String(r._id))).filter(Boolean).slice(0, limit).map(toCard);
}

/** Cards + variant info for client-side lists (cart, wishlist, compare, recently viewed). */
export async function lookupProducts(ids) {
  await connectDB();
  const valid = [...new Set(ids)].filter((id) => mongoose.isValidObjectId(id)).slice(0, 60);
  const products = await Product.find({ _id: { $in: valid }, isActive: true })
    .select('name slug brand price salePrice sellPrice stock images variants category isFeatured isDemo shortDescription sku specs')
    .populate('category', 'name slug')
    .lean();
  return products.map((p) => ({
    ...toCard(p),
    sku: p.sku,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    specs: p.specs || [],
    stock: p.variants?.length ? null : p.stock,
    variants: (p.variants || []).map((v) => ({ id: String(v._id), label: v.label, sku: v.sku, ...resolveOffer(p, v) })),
  }));
}

export async function searchSuggestions(q) {
  await connectDB();
  const term = q.trim().slice(0, 80);
  if (term.length < 2) return { products: [], categories: [] };
  const rx = new RegExp(escapeRegex(term), 'i');
  const [products, categories] = await Promise.all([
    Product.find({ isActive: true, $or: [{ name: rx }, { brand: rx }, { tags: rx }] })
      .select('name slug images price salePrice sellPrice variants.price stock variants.stock brand isDemo')
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(6)
      .lean(),
    Category.find({ isActive: true, name: rx }).select('name slug').limit(4).lean(),
  ]);
  return {
    products: products.map((p) => {
      const c = toCard(p);
      return { id: c.id, name: c.name, slug: c.slug, image: c.image, unitPrice: c.unitPrice, brand: c.brand, isDemo: c.isDemo };
    }),
    categories: categories.map((c) => ({ name: c.name, slug: c.slug })),
  };
}

/** Number of active demo products in a scope (used to keep demo pages out of search indexes). */
export const countDemoProducts = cache(async (categoryIds) => {
  await connectDB();
  const filter = { ...buildProductFilter({ categoryIds }), isDemo: true };
  return Product.countDocuments(filter);
});

export async function listIndexableProductSlugs() {
  await connectDB();
  // Demo products are never submitted to search engines.
  return Product.find({ isActive: true, isDemo: { $ne: true } }).select('slug updatedAt').lean();
}

// ---------- Admin ----------

export async function adminListProducts({ q, category, status, stock, page = 1, limit = 20 }) {
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { sku: rx }, { brand: rx }, { 'variants.sku': rx }];
  }
  if (category) filter.$and = [{ $or: [{ category }, { subcategory: category }] }];
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (stock === 'out') {
    filter.$and = [...(filter.$and || []), { $or: [{ variants: { $size: 0 }, stock: { $lte: 0 } }, { variants: { $ne: [] }, 'variants.stock': { $not: { $gt: 0 } } }] }];
  }
  if (stock === 'low') {
    filter.$expr = {
      $or: [
        { $and: [{ $eq: [{ $size: '$variants' }, 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] },
        { $gt: [{ $size: { $filter: { input: '$variants', cond: { $lte: ['$$this.stock', '$lowStockThreshold'] } } } }, 0] },
      ],
    };
  }
  const [items, total] = await Promise.all([
    Product.find(filter)
      .select('name slug sku brand price salePrice sellPrice stock lowStockThreshold variants isActive isFeatured isDemo images category soldCount updatedAt')
      .populate('category', 'name')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return plain({ items: items.map((p) => ({ ...p, totalStock: totalStock(p) })), total, page, limit });
}

export async function adminGetProduct(id) {
  const p = await Product.findById(id).lean();
  if (!p) throw notFound('Product not found.');
  return plain(p);
}

async function assertCategories(input) {
  const ids = [input.category, input.subcategory].filter(Boolean);
  const found = await Category.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) throw notFound('Selected category was not found.');
}

function normalizeInput(input) {
  return {
    ...input,
    slug: input.slug || slugify(input.name),
    subcategory: input.subcategory || null,
    salePrice: input.salePrice ?? null,
    sellPrice: computeSellPrice(input),
    stock: input.variants?.length ? 0 : input.stock,
  };
}

export async function createProduct(input) {
  await assertCategories(input);
  const data = normalizeInput(input);
  if (await Product.exists({ slug: data.slug })) throw conflict('A product with this slug already exists. Change the name or slug.');
  const product = await Product.create(data);
  return plain(product.toObject());
}

export async function updateProduct(id, input) {
  await assertCategories(input);
  const product = await Product.findById(id);
  if (!product) throw notFound('Product not found.');
  const data = normalizeInput(input);
  if (data.slug !== product.slug && (await Product.exists({ slug: data.slug }))) {
    throw conflict('A product with this slug already exists.');
  }
  const removedImages = product.images.filter((img) => !data.images.some((n) => n.publicId === img.publicId));
  product.set(data);
  await product.save();
  if (removedImages.length) await destroyImages(removedImages.map((i) => i.publicId));
  return plain(product.toObject());
}

export async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) throw notFound('Product not found.');
  await product.deleteOne();
  // Orders keep their own item snapshots, so history is not affected.
  if (product.images.length) await destroyImages(product.images.map((i) => i.publicId));
  return { ok: true };
}

export async function updateStock(id, { stock, variants }) {
  const product = await Product.findById(id);
  if (!product) throw notFound('Product not found.');
  if (product.variants.length && variants) {
    for (const { _id, stock: s } of variants) {
      const v = product.variants.id(_id);
      if (v) v.stock = s;
    }
  } else if (stock != null) {
    product.stock = stock;
  }
  await product.save();
  return plain({ _id: product._id, stock: product.stock, variants: product.variants, totalStock: totalStock(product) });
}
