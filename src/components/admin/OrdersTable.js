'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input, Segmented, Space, Table, Tag } from 'antd';
import { useGetAdminOrdersQuery } from '@/store/api/adminApi';
import { formatDateTime, formatPKR, formatPhone } from '@/lib/utils/format';
import PageTitle from './PageTitle';
import { OrderStatusTag, PaymentStatusTag } from './StatusTag';

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => ({ value: s, label: s ? s[0].toUpperCase() + s.slice(1) : 'All' }));

export default function OrdersTable() {
  const params = useSearchParams();
  const [args, setArgs] = useState({ page: 1, limit: 20, status: params.get('status') || '', q: '' });
  const { data, isFetching } = useGetAdminOrdersQuery(args, { pollingInterval: 60000 });

  return (
    <>
      <PageTitle title="Orders" description="New orders appear automatically every minute." />
      <Space wrap className="mb-4">
        <Segmented value={args.status} options={STATUS_OPTIONS} onChange={(status) => setArgs((a) => ({ ...a, page: 1, status }))} />
        <Input.Search placeholder="Order no., name, phone or email" allowClear onSearch={(q) => setArgs((a) => ({ ...a, page: 1, q }))} style={{ width: 280 }} />
      </Space>
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.items}
        scroll={{ x: 900 }}
        pagination={{ current: args.page, pageSize: args.limit, total: data?.total, onChange: (page, limit) => setArgs((a) => ({ ...a, page, limit })) }}
        columns={[
          { title: 'Order', dataIndex: 'orderNumber', render: (v, o) => <span><Link href={`/admin/orders/${o._id}`} className="font-medium">{v}</Link>{o.isDemo && <Tag color="orange" className="ml-1">DEMO</Tag>}</span> },
          { title: 'Date', dataIndex: 'createdAt', render: formatDateTime },
          { title: 'Customer', render: (_, o) => <span>{o.customer.name}<br /><span className="text-xs text-mist-400">{formatPhone(o.customer.phone)}</span></span> },
          { title: 'City', dataIndex: ['shippingAddress', 'city'] },
          { title: 'Items', render: (_, o) => o.items.reduce((n, i) => n + i.quantity, 0) },
          {
            title: 'Total',
            dataIndex: 'total',
            render: (v, o) => (
              <span>
                {formatPKR(v)}
                {o.shippingFee == null && o.status !== 'cancelled' && <Tag color="gold" className="ml-1">Shipping TBC</Tag>}
              </span>
            ),
          },
          { title: 'Status', dataIndex: 'status', render: (s) => <OrderStatusTag status={s} /> },
          { title: 'Payment', render: (_, o) => <PaymentStatusTag status={o.payment.status} /> },
        ]}
      />
    </>
  );
}
