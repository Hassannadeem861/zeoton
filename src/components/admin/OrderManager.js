'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Alert, App, Button, Card, Col, Descriptions, Input, InputNumber, Row, Select, Skeleton, Space, Table, Timeline } from 'antd';
import { useGetAdminOrderQuery, useUpdateOrderMutation } from '@/store/api/adminApi';
import { formatDateTime, formatPKR, formatPhone, ORDER_STATUS_LABELS, PAYMENT_LABELS } from '@/lib/utils/format';
import { getErrorMessage } from '@/lib/utils/errors';
import PageTitle from './PageTitle';
import { OrderStatusTag, PaymentStatusTag } from './StatusTag';

const NEXT = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

function OrderControls({ order }) {
  const { message, modal } = App.useApp();
  const [update, { isLoading }] = useUpdateOrderMutation();
  const [status, setStatus] = useState();
  const [note, setNote] = useState('');
  const [fee, setFee] = useState(order.shippingFee);
  const [tracking, setTracking] = useState({ courier: order.trackingInfo?.courier || '', trackingNumber: order.trackingInfo?.trackingNumber || '' });
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');

  const run = async (body, ok) => {
    try {
      await update({ id: order._id, ...body }).unwrap();
      message.success(ok);
      return true;
    } catch (err) {
      message.error(getErrorMessage(err));
      return false;
    }
  };

  const changeStatus = () => {
    const apply = async () => {
      if (await run({ status, note }, `Order marked ${ORDER_STATUS_LABELS[status].toLowerCase()}.`)) {
        setStatus(undefined);
        setNote('');
      }
    };
    if (status === 'cancelled') {
      modal.confirm({ title: 'Cancel this order?', content: 'Stock will be returned to inventory and any coupon use released.', okButtonProps: { danger: true }, onOk: apply });
    } else apply();
  };

  const options = NEXT[order.status];

  return (
    <Space orientation="vertical" size="middle" className="w-full">
      <Card title="Status">
        {options.length ? (
          <Space orientation="vertical" className="w-full">
            <Select placeholder="Change status to…" value={status} onChange={setStatus} options={options.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }))} className="w-full" />
            <Input placeholder="Note for history (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
            <Button type="primary" disabled={!status} loading={isLoading} onClick={changeStatus} block>Update status</Button>
          </Space>
        ) : (
          <p className="text-sm text-mist-400">This order is {order.status}; no further status changes.</p>
        )}
      </Card>

      {order.payment.method === 'bank_qr' && (
        <Card title="Payment (Meezan Bank QR)">
          <PaymentStatusTag status={order.payment.status} />
          {order.payment.proof?.url ? (
            <a href={order.payment.proof.url} target="_blank" rel="noopener noreferrer" className="mt-3 block">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of the customer's screenshot */}
              <img src={order.payment.proof.url} alt="Payment screenshot" className="max-h-96 w-full rounded-lg border border-line object-contain" />
            </a>
          ) : (
            <p className="mt-2 text-sm text-mist-400">No screenshot uploaded.</p>
          )}
          <p className="mt-2 text-xs text-mist-400">Check your Meezan Bank app: the amount ({formatPKR(order.total)}) must have arrived before you verify.</p>
          {order.payment.status === 'pending' && order.status !== 'cancelled' && (
            <Space className="mt-3" wrap>
              <Button type="primary" loading={isLoading} onClick={() => run({ paymentStatus: 'paid', ...(order.status === 'pending' ? { status: 'confirmed' } : {}), note: 'Payment verified' }, 'Payment verified. Order confirmed.')}>
                Verify payment
              </Button>
              <Button danger onClick={() => modal.confirm({ title: 'Reject this payment?', content: 'The order will be cancelled and stock returned.', okButtonProps: { danger: true }, onOk: () => run({ paymentStatus: 'failed', status: 'cancelled', note: 'Payment screenshot rejected' }, 'Payment rejected. Order cancelled.') })}>
                Reject (fake / not received)
              </Button>
            </Space>
          )}
        </Card>
      )}

      {order.payment.method === 'cod' && <Card title="Payment (Cash on Delivery)">
        <Space wrap>
          <PaymentStatusTag status={order.payment.status} />
          {order.payment.status !== 'paid' ? (
            <Button disabled={order.status !== 'delivered'} onClick={() => run({ paymentStatus: 'paid' }, 'Payment marked as collected.')} loading={isLoading}>
              Mark cash collected
            </Button>
          ) : (
            <Button onClick={() => run({ paymentStatus: 'pending' }, 'Payment marked unpaid.')}>Undo</Button>
          )}
        </Space>
        {order.status !== 'delivered' && order.payment.status !== 'paid' && <p className="mt-2 text-xs text-mist-400">Available after the order is delivered.</p>}
      </Card>}

      <Card title="Shipping charge">
        <Space.Compact className="w-full">
          <InputNumber prefix="Rs" min={0} precision={0} value={fee} onChange={setFee} placeholder="Not set" style={{ width: '100%' }} disabled={order.status === 'cancelled'} />
          <Button onClick={() => run({ shippingFee: fee ?? null }, 'Shipping charge saved; total updated.')} disabled={order.status === 'cancelled'}>Save</Button>
        </Space.Compact>
        <p className="mt-2 text-xs text-mist-400">The customer sees this on their order tracking page. Leave empty if not decided.</p>
      </Card>

      <Card title="Courier & tracking">
        <Space orientation="vertical" className="w-full">
          <Input placeholder="Courier name" value={tracking.courier} onChange={(e) => setTracking((t) => ({ ...t, courier: e.target.value }))} maxLength={60} />
          <Input placeholder="Tracking number" value={tracking.trackingNumber} onChange={(e) => setTracking((t) => ({ ...t, trackingNumber: e.target.value }))} maxLength={80} />
          <Button onClick={() => run({ trackingInfo: tracking }, 'Tracking info saved.')} block>Save tracking</Button>
        </Space>
      </Card>

      <Card title="Internal notes">
        <Input.TextArea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} maxLength={2000} placeholder="Visible to admins only" />
        <Button className="mt-2" onClick={() => run({ adminNotes }, 'Notes saved.')}>Save notes</Button>
      </Card>
    </Space>
  );
}

export default function OrderManager({ id }) {
  const { data: order, isLoading, isError } = useGetAdminOrderQuery(id);
  if (isLoading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (isError || !order) return <Alert type="error" title="Order not found." />;
  const a = order.shippingAddress;

  return (
    <>
      <PageTitle title={`Order ${order.orderNumber}`} description={`Placed ${formatDateTime(order.createdAt)}`} extra={<Link href="/admin/orders"><Button>Back to orders</Button></Link>} />
      {order.isDemo && <Alert type="warning" showIcon className="mb-4" title="Test order: contains demo products. Do not fulfil. Excluded from dashboard figures." />}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Space orientation="vertical" size="middle" className="w-full">
            <Card>
              <Descriptions
                column={{ xs: 1, sm: 2 }}
                size="small"
                items={[
                  { key: 'status', label: 'Status', children: <OrderStatusTag status={order.status} /> },
                  { key: 'payment', label: 'Payment', children: PAYMENT_LABELS[order.payment.method] || order.payment.method },
                  { key: 'customer', label: 'Customer', children: <>{order.customer.name}{order.user && <span className="ml-1 text-xs text-mist-400">(registered)</span>}</> },
                  { key: 'phone', label: 'Phone', children: <a href={`tel:${order.customer.phone}`}>{formatPhone(order.customer.phone)}</a> },
                  { key: 'email', label: 'Email', children: order.customer.email || '—' },
                  { key: 'coupon', label: 'Coupon', children: order.coupon?.code || '—' },
                  { key: 'address', label: 'Address', span: 2, children: `${a.fullName}, ${formatPhone(a.phone)} — ${a.addressLine}${a.area ? `, ${a.area}` : ''}, ${a.city}, ${a.province} ${a.postalCode || ''}` },
                  ...(order.notes ? [{ key: 'notes', label: 'Customer note', span: 2, children: order.notes }] : []),
                ]}
              />
            </Card>
            <Card title="Items">
              <Table
                size="small"
                rowKey={(r, i) => `${r.sku}-${i}`}
                pagination={false}
                dataSource={order.items}
                scroll={{ x: 520 }}
                columns={[
                  { title: 'Product', render: (_, i) => <span>{i.name}{i.variantLabel && <span className="text-mist-400"> — {i.variantLabel}</span>}</span> },
                  { title: 'SKU', dataIndex: 'sku' },
                  { title: 'Unit', dataIndex: 'unitPrice', render: formatPKR },
                  { title: 'Qty', dataIndex: 'quantity' },
                  { title: 'Total', dataIndex: 'lineTotal', render: formatPKR },
                ]}
              />
              <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-mist-400">Subtotal</dt><dd>{formatPKR(order.subtotal)}</dd></div>
                {order.discount > 0 && <div className="flex justify-between"><dt className="text-mist-400">Discount</dt><dd>−{formatPKR(order.discount)}</dd></div>}
                <div className="flex justify-between"><dt className="text-mist-400">Shipping</dt><dd>{order.shippingFee == null ? 'Not set' : formatPKR(order.shippingFee)}</dd></div>
                <div className="flex justify-between border-t border-line pt-1 font-semibold"><dt>Total</dt><dd>{formatPKR(order.total)}</dd></div>
              </dl>
            </Card>
            <Card title="History">
              <Timeline items={order.statusHistory.map((h) => ({ content: `${formatDateTime(h.at)} — ${ORDER_STATUS_LABELS[h.status] || h.status}${h.note ? ` (${h.note})` : ''}` }))} />
            </Card>
          </Space>
        </Col>
        <Col xs={24} xl={9}>
          <OrderControls key={order.updatedAt} order={order} />
        </Col>
      </Row>
    </>
  );
}
