'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { App, Input, InputNumber, Segmented, Space, Table, Tag } from 'antd';
import { useGetAdminProductsQuery, useUpdateStockMutation } from '@/store/api/adminApi';
import { getErrorMessage } from '@/lib/utils/errors';
import PageTitle from './PageTitle';

function StockInput({ value, onSave }) {
  const [v, setV] = useState(value);
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setV(value);
  }
  const commit = () => v != null && v !== value && onSave(v);
  return <InputNumber size="small" min={0} precision={0} value={v} onChange={setV} onBlur={commit} onPressEnter={commit} style={{ width: 96 }} aria-label="Stock quantity" />;
}

export default function InventoryTable() {
  const { message } = App.useApp();
  const params = useSearchParams();
  const [args, setArgs] = useState({ page: 1, limit: 25, q: '', stock: params.get('stock') || '' });
  const { data, isFetching } = useGetAdminProductsQuery(args);
  const [updateStock] = useUpdateStockMutation();

  // Optimistic update (see adminApi.updateStock); reverted automatically on failure.
  const save = async (body) => {
    try {
      await updateStock({ ...body, listArgs: args }).unwrap();
      message.success('Stock updated.');
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageTitle title="Inventory" description="Edit stock directly. Changes save when you press Enter or leave the field." />
      <Space wrap className="mb-4">
        <Segmented
          value={args.stock}
          onChange={(stock) => setArgs((a) => ({ ...a, page: 1, stock }))}
          options={[{ label: 'All', value: '' }, { label: 'Low stock', value: 'low' }, { label: 'Out of stock', value: 'out' }]}
        />
        <Input.Search placeholder="Search name or SKU" allowClear onSearch={(q) => setArgs((a) => ({ ...a, page: 1, q }))} style={{ width: 260 }} />
      </Space>
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.items}
        scroll={{ x: 760 }}
        pagination={{ current: args.page, pageSize: args.limit, total: data?.total, onChange: (page, limit) => setArgs((a) => ({ ...a, page, limit })) }}
        columns={[
          { title: 'Product', dataIndex: 'name', render: (n, p) => <Link href={`/admin/products/${p._id}`}>{n}</Link> },
          { title: 'SKU', dataIndex: 'sku' },
          {
            title: 'Stock',
            render: (_, p) =>
              p.variants?.length ? (
                <ul className="space-y-1.5">
                  {p.variants.map((v) => (
                    <li key={v._id} className="flex items-center gap-2 text-xs">
                      <span className="w-32 truncate text-mist-300">{v.label}</span>
                      <StockInput value={v.stock} onSave={(stock) => save({ id: p._id, variants: [{ _id: v._id, stock }] })} />
                    </li>
                  ))}
                </ul>
              ) : (
                <StockInput value={p.stock} onSave={(stock) => save({ id: p._id, stock })} />
              ),
          },
          { title: 'Alert at', dataIndex: 'lowStockThreshold' },
          {
            title: 'Total',
            dataIndex: 'totalStock',
            render: (v, p) => <Tag color={v === 0 ? 'red' : v <= p.lowStockThreshold ? 'gold' : 'green'}>{v}</Tag>,
          },
        ]}
      />
    </>
  );
}
