'use client';

import { useState } from 'react';
import { App, Input, Popconfirm, Switch, Table } from 'antd';
import { useGetCustomersQuery, useSetCustomerActiveMutation } from '@/store/api/adminApi';
import { formatDate, formatPKR, formatPhone } from '@/lib/utils/format';
import { getErrorMessage } from '@/lib/utils/errors';
import PageTitle from './PageTitle';

export default function CustomersTable() {
  const { message } = App.useApp();
  const [args, setArgs] = useState({ page: 1, limit: 20, q: '' });
  const { data, isFetching } = useGetCustomersQuery(args);
  const [setActive] = useSetCustomerActiveMutation();

  const toggle = async (c, isActive) => {
    try {
      await setActive({ id: c._id, isActive }).unwrap();
      message.success(isActive ? 'Account enabled.' : 'Account disabled and signed out.');
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageTitle title="Customers" description="Registered customer accounts. Guest orders are listed under Orders." />
      <Input.Search placeholder="Search name, email or phone" allowClear onSearch={(q) => setArgs((a) => ({ ...a, page: 1, q }))} style={{ width: 300 }} className="mb-4" />
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.items}
        scroll={{ x: 800 }}
        pagination={{ current: args.page, pageSize: args.limit, total: data?.total, onChange: (page, limit) => setArgs((a) => ({ ...a, page, limit })) }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Phone', dataIndex: 'phone', render: (p) => formatPhone(p) || '—' },
          { title: 'Orders', dataIndex: 'orders' },
          { title: 'Delivered value', dataIndex: 'deliveredValue', render: formatPKR },
          { title: 'Joined', dataIndex: 'createdAt', render: (d) => formatDate(d) },
          {
            title: 'Active',
            dataIndex: 'isActive',
            render: (active, c) =>
              active ? (
                <Popconfirm title="Disable this account?" description="The customer is signed out and cannot sign in." onConfirm={() => toggle(c, false)}>
                  <Switch checked aria-label="Account active" />
                </Popconfirm>
              ) : (
                <Switch checked={false} onChange={() => toggle(c, true)} aria-label="Account disabled" />
              ),
          },
        ]}
      />
    </>
  );
}
