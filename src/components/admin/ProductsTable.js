'use client';

import Link from 'next/link';
import { useState } from 'react';
import { App, Button, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useDeleteProductMutation, useGetAdminCategoriesQuery, useGetAdminProductsQuery } from '@/store/api/adminApi';
import { formatPKR } from '@/lib/utils/format';
import { getErrorMessage } from '@/lib/utils/errors';
import PageTitle from './PageTitle';

export default function ProductsTable() {
  const { message } = App.useApp();
  const [args, setArgs] = useState({ page: 1, limit: 20, q: '', category: '', status: '' });
  const { data, isFetching } = useGetAdminProductsQuery(args);
  const { data: categories = [] } = useGetAdminCategoriesQuery();
  const [remove] = useDeleteProductMutation();

  const set = (patch) => setArgs((a) => ({ ...a, page: 1, ...patch }));

  return (
    <>
      <PageTitle
        title="Products"
        description="Create, edit and publish products."
        extra={
          <Link href="/admin/products/new">
            <Button type="primary" icon={<Plus className="h-4 w-4" />}>New product</Button>
          </Link>
        }
      />
      <Space wrap className="mb-4">
        <Input.Search placeholder="Search name, SKU, brand" allowClear onSearch={(q) => set({ q })} style={{ width: 260 }} />
        <Select
          placeholder="All categories"
          allowClear
          style={{ width: 200 }}
          value={args.category || undefined}
          onChange={(v) => set({ category: v || '' })}
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
        />
        <Select
          placeholder="Any status"
          allowClear
          style={{ width: 150 }}
          value={args.status || undefined}
          onChange={(v) => set({ status: v || '' })}
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
        />
      </Space>
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.items}
        scroll={{ x: 900 }}
        pagination={{
          current: args.page,
          pageSize: args.limit,
          total: data?.total,
          showSizeChanger: true,
          onChange: (page, limit) => setArgs((a) => ({ ...a, page, limit })),
        }}
        columns={[
          {
            title: 'Product',
            dataIndex: 'name',
            render: (name, p) => (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                  {p.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                    <img src={p.images[0].url.replace('/upload/', '/upload/c_limit,w_96/')} alt="" className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="min-w-0">
                  <Link href={`/admin/products/${p._id}`} className="font-medium">{name}</Link>
                  <p className="text-xs text-mist-400">{p.sku}{p.brand ? ` · ${p.brand}` : ''}</p>
                </div>
              </div>
            ),
          },
          { title: 'Category', dataIndex: ['category', 'name'] },
          {
            title: 'Price',
            dataIndex: 'sellPrice',
            render: (v, p) => (
              <span>
                {formatPKR(v)}
                {p.salePrice != null && <Tag color="blue" className="ml-1">Sale</Tag>}
              </span>
            ),
          },
          {
            title: 'Stock',
            dataIndex: 'totalStock',
            render: (v, p) => <Tag color={v === 0 ? 'red' : v <= p.lowStockThreshold ? 'gold' : 'green'}>{v}{p.variants?.length ? ` (${p.variants.length} variants)` : ''}</Tag>,
          },
          { title: 'Sold', dataIndex: 'soldCount' },
          {
            title: 'Status',
            render: (_, p) => (
              <Space size={4}>
                <Tag color={p.isActive ? 'green' : 'default'}>{p.isActive ? 'Active' : 'Inactive'}</Tag>
                {p.isFeatured && <Tag color="blue">Featured</Tag>}
                {p.isDemo && <Tag color="orange">DEMO</Tag>}
              </Space>
            ),
          },
          {
            title: '',
            width: 110,
            render: (_, p) => (
              <Space>
                <Link href={`/admin/products/${p._id}`}><Button size="small" icon={<Pencil className="h-3.5 w-3.5" />} aria-label="Edit" /></Link>
                <Popconfirm
                  title="Delete this product?"
                  description="Its images are removed from Cloudinary. Past orders keep their own copy."
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    try {
                      await remove(p._id).unwrap();
                      message.success('Product deleted.');
                    } catch (err) {
                      message.error(getErrorMessage(err));
                    }
                  }}
                >
                  <Button size="small" danger icon={<Trash2 className="h-3.5 w-3.5" />} aria-label="Delete" />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </>
  );
}
