'use client';

import Link from 'next/link';
import { Alert, Card, Col, Empty, Row, Skeleton, Statistic, Table, Tag } from 'antd';
import { useGetDashboardQuery } from '@/store/api/adminApi';
import { formatDate, formatPKR } from '@/lib/utils/format';
import PageTitle from './PageTitle';
import { OrderStatusTag, PaymentStatusTag } from './StatusTag';

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useGetDashboardQuery(undefined, { refetchOnMountOrArgChange: 30 });

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (isError || !data) return <Alert type="error" title="Could not load the dashboard." action={<a onClick={refetch}>Retry</a>} />;

  const stats = [
    { title: 'Collected revenue', value: formatPKR(data.revenue.collected), hint: `${data.revenue.collectedOrders} delivered & paid orders` },
    { title: 'Open order value', value: formatPKR(data.revenue.openOrderValue), hint: 'Pending, confirmed and shipped' },
    { title: 'Total orders', value: data.orders.total, hint: `${data.orders.byStatus.pending} awaiting confirmation` },
    { title: 'Active products', value: data.products.active, hint: `${data.products.inactive} inactive · ${data.products.demo} demo` },
    { title: 'Customers', value: data.customers, hint: 'Registered accounts' },
    { title: 'New messages', value: data.newMessages, hint: <Link href="/admin/messages">Open inbox</Link> },
  ];

  return (
    <>
      <PageTitle title="Dashboard" description="All figures come from real orders and products in the database." />
      {data.products.demo > 0 && (
        <Alert type="warning" showIcon className="mb-4" title={`Demo catalog active: ${data.products.demo} demo products. ${data.demoOrders} test order(s) with demo items are excluded from these figures.`} />
      )}
      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col key={s.title} xs={24} sm={12} xl={8}>
            <Card>
              <Statistic title={s.title} value={s.value} />
              <p className="mt-1 text-xs text-mist-400">{s.hint}</p>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} xl={14}>
          <Card title="Recent orders" extra={<Link href="/admin/orders">All orders</Link>}>
            <Table
              size="small"
              rowKey="_id"
              pagination={false}
              dataSource={data.recentOrders}
              locale={{ emptyText: <Empty description="No orders yet" /> }}
              scroll={{ x: 520 }}
              columns={[
                { title: 'Order', dataIndex: 'orderNumber', render: (v, r) => <Link href={`/admin/orders/${r._id}`}>{v}</Link> },
                { title: 'Customer', dataIndex: ['customer', 'name'] },
                { title: 'Total', dataIndex: 'total', render: formatPKR },
                { title: 'Status', dataIndex: 'status', render: (s) => <OrderStatusTag status={s} /> },
                { title: 'Payment', dataIndex: ['payment', 'status'], render: (s) => <PaymentStatusTag status={s} /> },
                { title: 'Date', dataIndex: 'createdAt', render: (d) => formatDate(d) },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="Low-stock alerts" extra={<Link href="/admin/inventory?stock=low">Inventory</Link>}>
            {data.lowStock.length ? (
              <ul className="divide-y divide-line">
                {data.lowStock.map((p) => (
                  <li key={p._id} className="flex items-start justify-between gap-3 py-2 text-sm">
                    <Link href={`/admin/products/${p._id}`} className="min-w-0 truncate">{p.name}</Link>
                    <span className="shrink-0 text-right">
                      {p.lowVariants?.length ? (
                        p.lowVariants.map((v) => <Tag key={v.label} color={v.stock === 0 ? 'red' : 'gold'}>{v.label}: {v.stock}</Tag>)
                      ) : (
                        <Tag color={p.stock === 0 ? 'red' : 'gold'}>{p.stock} left</Tag>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty description="No low-stock products" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={12}>
          <Card title="Orders by status">
            <ul className="space-y-2 text-sm">
              {Object.entries(data.orders.byStatus).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between">
                  <OrderStatusTag status={status} />
                  <Link href={`/admin/orders?status=${status}`}>{count}</Link>
                </li>
              ))}
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Top products (delivered units)">
            {data.topProducts.length ? (
              <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                {data.topProducts.map((p) => (
                  <li key={p._id}>
                    {p.name} <span className="text-mist-400">— {p.soldCount} sold</span>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty description="No delivered orders yet" />
            )}
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Last 30 days (excluding cancelled)">
            <Table
              size="small"
              rowKey="_id"
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              dataSource={[...data.daily].reverse()}
              locale={{ emptyText: <Empty description="No orders in the last 30 days" /> }}
              columns={[
                { title: 'Date', dataIndex: '_id' },
                { title: 'Orders', dataIndex: 'orders' },
                { title: 'Order value', dataIndex: 'value', render: formatPKR },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
