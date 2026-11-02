import { Tag } from 'antd';
import { ORDER_STATUS_LABELS } from '@/lib/utils/format';

const ORDER_COLORS = { pending: 'gold', confirmed: 'blue', shipped: 'geekblue', delivered: 'green', cancelled: 'red' };
const PAYMENT_COLORS = { pending: 'default', paid: 'green', failed: 'red', refunded: 'purple' };

export const OrderStatusTag = ({ status }) => <Tag color={ORDER_COLORS[status]}>{ORDER_STATUS_LABELS[status] || status}</Tag>;
export const PaymentStatusTag = ({ status }) => <Tag color={PAYMENT_COLORS[status]}>{status === 'pending' ? 'Unpaid' : status}</Tag>;
