import mongoose from 'mongoose';
import { defineModel } from './defineModel.js';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 30 },
    description: { type: String, trim: true, maxlength: 200 },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0, default: null },
    minOrder: { type: Number, min: 0, default: 0 },
    maxUses: { type: Number, min: 0, default: null },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = defineModel('Coupon', couponSchema);
