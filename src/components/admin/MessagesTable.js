'use client';

import { useState } from 'react';
import { App, Button, Popconfirm, Segmented, Select, Table, Tag } from 'antd';
import { Trash2 } from 'lucide-react';
import { useDeleteMessageMutation, useGetMessagesQuery, useUpdateMessageMutation } from '@/store/api/adminApi';
import { formatDateTime } from '@/lib/utils/format';
import { getErrorMessage } from '@/lib/utils/errors';
import PageTitle from './PageTitle';

const COLORS = { new: 'blue', read: 'default', resolved: 'green' };

export default function MessagesTable() {
  const { message } = App.useApp();
  const [args, setArgs] = useState({ page: 1, limit: 20, status: 'new' });
  const { data, isFetching } = useGetMessagesQuery(args);
  const [update] = useUpdateMessageMutation();
  const [remove] = useDeleteMessageMutation();

  const act = async (fn, ok) => {
    try {
      await fn().unwrap();
      message.success(ok);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageTitle title="Messages" description="Messages sent from the Contact page. Reply by email or phone." />
      <Segmented
        className="mb-4"
        value={args.status}
        onChange={(status) => setArgs((a) => ({ ...a, page: 1, status }))}
        options={[{ value: 'new', label: 'New' }, { value: 'read', label: 'Read' }, { value: 'resolved', label: 'Resolved' }, { value: '', label: 'All' }]}
      />
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.items}
        scroll={{ x: 760 }}
        expandable={{ expandedRowRender: (m) => <p className="whitespace-pre-wrap text-sm">{m.message}</p> }}
        pagination={{ current: args.page, pageSize: args.limit, total: data?.total, onChange: (page, limit) => setArgs((a) => ({ ...a, page, limit })) }}
        columns={[
          { title: 'Received', dataIndex: 'createdAt', render: formatDateTime },
          { title: 'From', render: (_, m) => <span>{m.name}<br /><a href={`mailto:${m.email}`} className="text-xs">{m.email}</a>{m.phone && <span className="text-xs text-mist-400"> · {m.phone}</span>}</span> },
          { title: 'Subject', dataIndex: 'subject', render: (s) => s || '—' },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s, m) => (
              <Select size="small" value={s} style={{ width: 120 }} onChange={(status) => act(() => update({ id: m._id, status }), 'Status updated.')}
                options={['new', 'read', 'resolved'].map((v) => ({ value: v, label: <Tag color={COLORS[v]}>{v}</Tag> }))} />
            ),
          },
          {
            title: '',
            width: 60,
            render: (_, m) => (
              <Popconfirm title="Delete this message?" okButtonProps={{ danger: true }} onConfirm={() => act(() => remove(m._id), 'Message deleted.')}>
                <Button size="small" danger icon={<Trash2 className="h-3.5 w-3.5" />} aria-label="Delete" />
              </Popconfirm>
            ),
          },
        ]}
      />
    </>
  );
}
