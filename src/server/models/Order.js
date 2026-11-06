import mongoose from 'mongoose';
import { defineModel } from './defineModel.js';

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    name: { type: String, required: true },
    variantLabel: String,
    sku: { type: String, required: true },
    slug: String,
    image: String,
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      area: String,
      addressLine: { type: String, required: true },
      postalCode: String,
    },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    coupon: { code: String, type: { type: String }, value: Number },
    // null = shipping charge not decided yet; the admin sets it on the order.
    shippingFee: { type: Number, default: null, min: 0 },
    total: { type: Number, required: true, min: 0 },
    payment: {
      method: { type: String, required: true, default: 'cod' },
      status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
      provider: { type: String, default: null },
      transactionId: { type: String, default: null },
      paidAt: Date,
      // Payment screenshot uploaded by the customer (bank QR transfers).
      proof: { url: String, publicId: String, uploadedAt: Date },
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    statusHistory: [
      {
        _id: false,
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
    trackingInfo: { courier: String, trackingNumber: String },
    notes: { type: String, trim: true, maxlength: 500 },
    adminNotes: { type: String, trim: true, maxlength: 2000 },
    soldCounted: { type: Boolean, default: false },
    // Secret for the checkout success page to read live status (not exposed elsewhere).
    statusToken: { type: String, select: false },
    // True when the order contains demo products (test order; excluded from dashboard figures).
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ createdAt: -1 });

export const Order = defineModel('Order', orderSchema);
