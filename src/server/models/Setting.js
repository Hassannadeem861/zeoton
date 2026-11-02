import mongoose from 'mongoose';
import { defineModel } from './defineModel.js';

// Admin-editable configuration and website content, one document per key
// ('store', 'policies', 'content', 'faq', 'seo'). Defaults live in settingsService.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, minimize: false },
);

export const Setting = defineModel('Setting', settingSchema);
