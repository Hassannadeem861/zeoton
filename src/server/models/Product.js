import mongoose from 'mongoose';
import { defineModel } from './defineModel.js';

export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
    alt: { type: String, trim: true, maxlength: 160 },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 80 },
  sku: { type: String, required: true, trim: true, uppercase: true },
  price: { type: Number, min: 0 },
  salePrice: { type: Number, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    brand: { type: String, trim: true, maxlength: 60 },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    description: { type: String, trim: true, maxlength: 10000 },
    specs: [{ _id: false, label: { type: String, trim: true }, value: { type: String, trim: true } }],
    images: { type: [imageSchema], default: [] },
    // Prices are whole PKR rupees.
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0, default: null },
    // Lowest effective selling price across the product/variants (maintained by productService).
    sellPrice: { type: Number, min: 0, required: true },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    variants: { type: [variantSchema], default: [] },
    tags: [{ type: String, trim: true, lowercase: true }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    // Demo product: placeholder name/price/specs/stock, labelled in the UI and never indexed.
    isDemo: { type: Boolean, default: false },
    // Real units delivered (incremented only when an order is marked delivered).
    soldCount: { type: Number, default: 0, min: 0 },
    seo: {
      title: { type: String, trim: true, maxlength: 70 },
      description: { type: String, trim: true, maxlength: 160 },
    },
  },
  { timestamps: true },
);

productSchema.index({ isActive: 1, category: 1, sellPrice: 1 });
productSchema.index({ isActive: 1, sellPrice: 1 });
productSchema.index({ isActive: 1, subcategory: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ isDemo: 1, isActive: 1 });
productSchema.index({ 'variants.sku': 1 }, { unique: true, partialFilterExpression: { 'variants.sku': { $exists: true } } });

export const Product = defineModel('Product', productSchema);
