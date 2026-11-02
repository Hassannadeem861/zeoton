import mongoose from 'mongoose';
import { defineModel } from './defineModel.js';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    description: { type: String, trim: true, maxlength: 2000 },
    image: {
      url: String,
      publicId: String,
      width: Number,
      height: Number,
      alt: String,
    },
    seo: {
      title: { type: String, trim: true, maxlength: 70 },
      description: { type: String, trim: true, maxlength: 160 },
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // Demo catalog content for design review (removable with `npm run demo:remove`).
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

categorySchema.index({ isActive: 1, sortOrder: 1 });

export const Category = defineModel('Category', categorySchema);
