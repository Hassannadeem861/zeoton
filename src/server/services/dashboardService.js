import 'server-only';
import { Order, Product, User, ContactMessage } from '@/server/models';
import { plain } from '@/server/utils';

// All figures are computed from real orders/products. Nothing is estimated.
// Test orders that contain demo products are excluded.
const REAL = { isDemo: { $ne: true } };
export async function getDashboard() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [statusRows, revenueRows, productCounts, customers, demoOrders, lowStock, recentOrders, daily, topProducts, newMessages] =
    await Promise.all([
      Order.aggregate([{ $match: REAL }, { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { ...REAL, status: 'delivered', 'payment.status': 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]),
      Product.aggregate([{ $group: { _id: '$isActive', count: { $sum: 1 }, demo: { $sum: { $cond: ['$isDemo', 1, 0] } } } }]),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({ isDemo: true }),
      Product.aggregate([
        { $match: { isActive: true, isDemo: { $ne: true } } },
        {
          $addFields: {
            lowVariants: { $filter: { input: '$variants', cond: { $lte: ['$$this.stock', '$lowStockThreshold'] } } },
          },
        },
        {
          $match: {
            $or: [
              { variants: { $size: 0 }, $expr: { $lte: ['$stock', '$lowStockThreshold'] } },
              { 'lowVariants.0': { $exists: true } },
            ],
          },
        },
        { $project: { name: 1, sku: 1, stock: 1, lowStockThreshold: 1, 'lowVariants.label': 1, 'lowVariants.stock': 1 } },
        { $sort: { stock: 1 } },
        { $limit: 20 },
      ]),
      Order.find(REAL).select('orderNumber customer.name total status payment.status createdAt').sort({ createdAt: -1 }).limit(8).lean(),
      Order.aggregate([
        { $match: { ...REAL, createdAt: { $gte: since30 }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Karachi' } },
            orders: { $sum: 1 },
            value: { $sum: '$total' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Product.find({ soldCount: { $gt: 0 }, isDemo: { $ne: true } }).select('name soldCount').sort({ soldCount: -1 }).limit(5).lean(),
      ContactMessage.countDocuments({ status: 'new' }),
    ]);

  const byStatus = Object.fromEntries(statusRows.map((r) => [r._id, { count: r.count, value: r.value }]));
  const openStatuses = ['pending', 'confirmed', 'shipped'];

  return plain({
    revenue: {
      collected: revenueRows[0]?.revenue || 0,
      collectedOrders: revenueRows[0]?.orders || 0,
      openOrderValue: openStatuses.reduce((s, k) => s + (byStatus[k]?.value || 0), 0),
    },
    orders: {
      total: statusRows.reduce((s, r) => s + r.count, 0),
      byStatus: Object.fromEntries(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((k) => [k, byStatus[k]?.count || 0])),
    },
    products: {
      active: productCounts.find((r) => r._id === true)?.count || 0,
      inactive: productCounts.find((r) => r._id === false)?.count || 0,
      demo: productCounts.reduce((s, r) => s + (r.demo || 0), 0),
    },
    demoOrders,
    customers,
    lowStock,
    recentOrders,
    daily,
    topProducts,
    newMessages,
  });
}
