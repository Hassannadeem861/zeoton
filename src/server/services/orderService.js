import 'server-only';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Counter, Coupon, Media, Order, Product, User } from '@/server/models';
import { PROOF_FOLDER } from '@/server/media/paymentProof';
import { HttpError, notFound } from '@/server/http/errors';
import { getPaymentProvider } from '@/server/payments';
import { escapeRegex, plain } from '@/server/utils';
import { priceCart } from './cartService';
import { getSettings } from './settingsService';

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

async function nextOrderNumber(session) {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'order' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after', session },
  );
  return `ZT-${String(counter.seq).padStart(6, '0')}`;
}

async function reserveStock(line, session) {
  const qty = line.quantity;
  const res = line.variantId
    ? await Product.updateOne(
        { _id: line.productId, isActive: true, variants: { $elemMatch: { _id: line.variantId, stock: { $gte: qty } } } },
        { $inc: { 'variants.$.stock': -qty } },
        { session },
      )
    : await Product.updateOne({ _id: line.productId, isActive: true, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { session });
  if (res.modifiedCount !== 1) {
    throw new HttpError(409, `"${line.name}" just went out of stock. Please review your cart.`, { code: 'STOCK_CHANGED' });
  }
}

async function releaseStock(item, session) {
  if (item.variantId) {
    await Product.updateOne(
      { _id: item.product, 'variants._id': item.variantId },
      { $inc: { 'variants.$.stock': item.quantity } },
      { session },
    );
  } else {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
  }
}

/** Creates an order atomically: price check, stock reservation, coupon usage and numbering. */
export async function placeOrder(input, user) {
  const store = await getSettings('store');
  const provider = getPaymentProvider(input.paymentMethod);
  if (!provider || !provider.isEnabled(store)) throw new HttpError(400, 'This payment method is not available.');

  let proof = null;
  if (provider.requiresProof) {
    const media = input.paymentProof
      ? await Media.findOne({ publicId: input.paymentProof.publicId, folder: PROOF_FOLDER, usedBy: null }).lean()
      : null;
    if (!media) throw new HttpError(400, 'Please upload your payment screenshot.', { code: 'PAYMENT_PROOF_REQUIRED' });
    proof = { url: media.url, publicId: media.publicId, uploadedAt: media.createdAt };
  }

  const statusToken = crypto.randomBytes(16).toString('hex');
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const quote = await priceCart({ items: input.items, couponCode: input.couponCode }, { session });
      if (quote.hasIssues) {
        throw new HttpError(409, 'Some items in your cart changed. Please review your cart before placing the order.', {
          code: 'CART_CHANGED',
          details: { lines: quote.lines.filter((l) => l.issue) },
        });
      }
      if (input.couponCode && quote.couponError) throw new HttpError(400, quote.couponError, { code: 'COUPON_INVALID' });

      for (const line of quote.lines) await reserveStock(line, session);

      if (quote.coupon) {
        const used = await Coupon.updateOne(
          { _id: quote.coupon._id, $or: [{ maxUses: null }, { $expr: { $lt: ['$usedCount', '$maxUses'] } }] },
          { $inc: { usedCount: 1 } },
          { session },
        );
        if (used.modifiedCount !== 1) throw new HttpError(400, 'This coupon has reached its usage limit.');
      }

      const addr = input.shippingAddress;
      const [created] = await Order.create(
        [
          {
            orderNumber: await nextOrderNumber(session),
            user: user?.id || null,
            customer: { name: addr.fullName, email: input.email || user?.email, phone: addr.phone },
            shippingAddress: addr,
            items: quote.lines.map((l) => ({
              product: l.productId,
              variantId: l.variantId,
              name: l.name,
              variantLabel: l.variantLabel,
              sku: l.sku,
              slug: l.slug,
              image: l.image,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
              lineTotal: l.lineTotal,
            })),
            subtotal: quote.subtotal,
            discount: quote.discount,
            coupon: quote.coupon ? { code: quote.coupon.code, type: quote.coupon.type, value: quote.coupon.value } : undefined,
            shippingFee: quote.shipping.fee,
            total: quote.total,
            payment: { method: provider.id, status: 'pending', ...(proof ? { proof } : {}) },
            status: 'pending',
            statusHistory: [{ status: 'pending', note: 'Order placed' }],
            notes: input.notes,
            statusToken,
            isDemo: quote.hasDemoItems,
          },
        ],
        { session },
      );
      order = created;
    });
  } finally {
    await session.endSession();
  }

  if (proof) await Media.updateOne({ publicId: proof.publicId }, { $set: { usedBy: order._id } });
  const payment = await provider.initiate(order);

  if (user && input.saveAddress) {
    await saveAddressIfNew(user.id, input.shippingAddress).catch((err) => console.warn('[order] save address failed', err.message));
  }

  return {
    orderNumber: order.orderNumber,
    statusToken,
    total: order.total,
    shippingPending: order.shippingFee == null,
    payment: { method: provider.id, status: payment.status, redirectUrl: payment.redirectUrl || null },
  };
}

async function saveAddressIfNew(userId, addr) {
  const user = await User.findById(userId).select('addresses');
  if (!user) return;
  const exists = user.addresses.some(
    (a) => a.addressLine === addr.addressLine && a.city === addr.city && a.phone === addr.phone,
  );
  if (!exists && user.addresses.length < 10) {
    user.addresses.push({ ...addr, isDefault: user.addresses.length === 0 });
    await user.save();
  }
}

function publicOrderView(o, { includeAddress }) {
  return plain({
    orderNumber: o.orderNumber,
    status: o.status,
    statusHistory: o.statusHistory,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      name: i.name,
      variantLabel: i.variantLabel,
      slug: i.slug,
      image: i.image,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
    subtotal: o.subtotal,
    discount: o.discount,
    coupon: o.coupon?.code ? { code: o.coupon.code } : null,
    shippingFee: o.shippingFee,
    total: o.total,
    payment: { method: o.payment.method, status: o.payment.status },
    trackingInfo: o.trackingInfo,
    shippingAddress: includeAddress ? o.shippingAddress : { city: o.shippingAddress.city, province: o.shippingAddress.province },
  });
}

export async function getOrdersForUser(userId, { page = 1, limit = 10 } = {}) {
  const filter = { user: userId };
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return { items: items.map((o) => publicOrderView(o, { includeAddress: true })), total, page, limit };
}

export async function getOrderForUser(userId, orderNumber) {
  const order = await Order.findOne({ user: userId, orderNumber }).lean();
  if (!order) throw notFound('Order not found.');
  return publicOrderView(order, { includeAddress: true });
}

/** Live status for the checkout success page (order number + secret token from checkout). */
export async function getOrderStatusByToken(orderNumber, token) {
  if (!/^ZT-\d{6,}$/.test(orderNumber || '') || !/^[a-f0-9]{32}$/.test(token || '')) return null;
  const o = await Order.findOne({ orderNumber, statusToken: token }).select('status payment.method payment.status').lean();
  return o ? { status: o.status, paymentMethod: o.payment.method, paymentStatus: o.payment.status } : null;
}

/** Guest tracking: order number + phone must both match. No full address is returned. */
export async function trackOrder({ orderNumber, phone }) {
  const order = await Order.findOne({
    orderNumber,
    $or: [{ 'customer.phone': phone }, { 'shippingAddress.phone': phone }],
  }).lean();
  if (!order) throw notFound('We could not find an order with that order number and phone number.');
  return publicOrderView(order, { includeAddress: false });
}

// ---------- Admin ----------

export async function adminListOrders({ status, q, page = 1, limit = 20 }) {
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ orderNumber: rx }, { 'customer.name': rx }, { 'customer.phone': rx }, { 'customer.email': rx }];
  }
  const [items, total] = await Promise.all([
    Order.find(filter)
      .select('orderNumber customer total status payment shippingFee createdAt shippingAddress.city items.quantity isDemo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);
  return plain({ items, total, page, limit });
}

export async function adminGetOrder(id) {
  const order = await Order.findById(id).populate('user', 'name email').lean();
  if (!order) throw notFound('Order not found.');
  return plain(order);
}

export async function adminUpdateOrder(id, input) {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);
      if (!order) throw notFound('Order not found.');

      if (input.status && input.status !== order.status) {
        if (!ALLOWED_TRANSITIONS[order.status].includes(input.status)) {
          throw new HttpError(400, `An order that is "${order.status}" cannot be changed to "${input.status}".`);
        }
        if (input.status === 'cancelled') {
          for (const item of order.items) await releaseStock(item, session);
          if (order.coupon?.code) {
            await Coupon.updateOne({ code: order.coupon.code, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }, { session });
          }
        }
        if (input.status === 'delivered' && !order.soldCounted) {
          for (const item of order.items) {
            await Product.updateOne({ _id: item.product }, { $inc: { soldCount: item.quantity } }, { session });
          }
          order.soldCounted = true;
        }
        order.status = input.status;
        order.statusHistory.push({ status: input.status, note: input.note });
      }

      if (input.paymentStatus && input.paymentStatus !== order.payment.status) {
        order.payment.status = input.paymentStatus;
        order.payment.paidAt = input.paymentStatus === 'paid' ? new Date() : undefined;
      }

      if (input.shippingFee !== undefined && input.shippingFee !== order.shippingFee) {
        if (order.status === 'cancelled') throw new HttpError(400, 'Cancelled orders cannot be changed.');
        order.shippingFee = input.shippingFee;
        order.total = order.subtotal - order.discount + (input.shippingFee || 0);
      }

      if (input.trackingInfo) order.trackingInfo = { ...order.trackingInfo, ...input.trackingInfo };
      if (input.adminNotes !== undefined) order.adminNotes = input.adminNotes;

      await order.save({ session });
      result = order.toObject();
    });
  } finally {
    await session.endSession();
  }
  return plain(result);
}
