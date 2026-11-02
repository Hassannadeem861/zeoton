import mongoose from 'mongoose';
import { defineModel } from './defineModel.js';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 40 },
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, maxlength: 60 },
    area: { type: String, trim: true, maxlength: 120 },
    addressLine: { type: String, required: true, trim: true, maxlength: 240 },
    postalCode: { type: String, trim: true, maxlength: 5 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
    isActive: { type: Boolean, default: true },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.index({ role: 1, createdAt: -1 });

export const User = defineModel('User', userSchema);
