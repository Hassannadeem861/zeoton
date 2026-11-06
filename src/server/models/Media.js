import mongoose from 'mongoose';
import { defineModel } from './defineModel.js';

// Every optimized image uploaded to Cloudinary. Products embed a copy of the
// fields they need; this collection is the source of truth for cleanup.
const mediaSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    originalBytes: Number,
    originalFormat: String,
    quality: Number,
    withinTarget: { type: Boolean, default: true },
    folder: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Payment proofs: the order that used this upload (each proof can be used once).
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true },
);

export const Media = defineModel('Media', mediaSchema);
