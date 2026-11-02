'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { App, Button, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Radio, Row, Space, Switch, Table, Tag } from 'antd';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { couponSchema } from '@/lib/validation/admin';
import { useCreateCouponMutation, useDeleteCouponMutation, useGetCouponsQuery, useUpdateCouponMutation } from '@/store/api/adminApi';
import { formatDate, formatPKR } from '@/lib/utils/format';
import { getErrorMessage } from '@/lib/utils/errors';
import { RHFItem, setServerErrors } from './rhf';
import PageTitle from './PageTitle';

const empty = { code: '', description: '', type: 'percent', value: 10, maxDiscount: null, minOrder: 0, maxUses: null, startsAt: null, expiresAt: null, isActive: true };

function CouponModal({ open, coupon, onClose }) {
  const { message } = App.useApp();
  const [create, { isLoading: c }] = useCreateCouponMutation();
  const [update, { isLoading: u }] = useUpdateCouponMutation();
  const { control, handleSubmit, setError } = useForm({ resolver: zodResolver(couponSchema), values: coupon ? { ...empty, ...coupon } : empty });
  const type = useWatch({ control, name: 'type' });

  const onSubmit = async (values) => {
    try {
      if (coupon) await update({ id: coupon._id, ...values }).unwrap();
      else await create(values).unwrap();
      message.success('Coupon saved.');
      onClose();
    } catch (err) {
      if (!setServerErrors(err, setError)) message.error(getErrorMessage(err));
    }
  };

  const date = (p) => <DatePicker {...p} value={p.value ? dayjs(p.value) : null} onChange={(d) => p.onChange(d ? d.toISOString() : null)} showTime style={{ width: '100%' }} />;

  return (
    <Modal open={open} title={coupon ? 'Edit coupon' : 'New coupon'} onCancel={onClose} onOk={handleSubmit(onSubmit)} okText="Save" confirmLoading={c || u} destroyOnHidden>
      <Form layout="vertical" component="div">
        <RHFItem control={control} name="code" label="Code" required render={(p) => <Input {...p} style={{ textTransform: 'uppercase' }} />} />
        <RHFItem control={control} name="description" label="Internal description" render={(p) => <Input {...p} />} />
        <RHFItem control={control} name="type" label="Type" render={(p) => (
          <Radio.Group {...p} options={[{ value: 'percent', label: 'Percent off' }, { value: 'fixed', label: 'Fixed amount (PKR)' }]} />
        )} />
        <Row gutter={12}>
          <Col span={12}><RHFItem control={control} name="value" label={type === 'percent' ? 'Percent' : 'Amount (Rs)'} required render={(p) => <InputNumber {...p} min={0} style={{ width: '100%' }} />} /></Col>
          <Col span={12}><RHFItem control={control} name="maxDiscount" label="Max discount (Rs)" render={(p) => <InputNumber {...p} min={0} precision={0} style={{ width: '100%' }} placeholder="No cap" />} /></Col>
          <Col span={12}><RHFItem control={control} name="minOrder" label="Minimum order (Rs)" render={(p) => <InputNumber {...p} min={0} precision={0} style={{ width: '100%' }} />} /></Col>
          <Col span={12}><RHFItem control={control} name="maxUses" label="Max uses" render={(p) => <InputNumber {...p} min={1} precision={0} style={{ width: '100%' }} placeholder="Unlimited" />} /></Col>
          <Col span={12}><RHFItem control={control} name="startsAt" label="Starts" render={date} /></Col>
          <Col span={12}><RHFItem control={control} name="expiresAt" label="Expires" render={date} /></Col>
        </Row>
        <RHFItem control={control} name="isActive" label="Active" checkbox render={(p) => <Switch {...p} />} />
      </Form>
    </Modal>
  );
}

export default function CouponsManager() {
  const { message } = App.useApp();
  const { data = [], isFetching } = useGetCouponsQuery();
  const [remove] = useDeleteCouponMutation();
  const [editing, setEditing] = useState(undefined);

  return (
    <>
      <PageTitle title="Coupons" description="Discount codes customers can apply at checkout." extra={<Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(null)}>New coupon</Button>} />
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data}
        scroll={{ x: 800 }}
        columns={[
          { title: 'Code', dataIndex: 'code', render: (c) => <strong>{c}</strong> },
          { title: 'Discount', render: (_, c) => (c.type === 'percent' ? `${c.value}%${c.maxDiscount ? ` (max ${formatPKR(c.maxDiscount)})` : ''}` : formatPKR(c.value)) },
          { title: 'Min order', dataIndex: 'minOrder', render: (v) => (v ? formatPKR(v) : '—') },
          { title: 'Used', render: (_, c) => `${c.usedCount}${c.maxUses ? ` / ${c.maxUses}` : ''}` },
          { title: 'Valid', render: (_, c) => `${c.startsAt ? formatDate(c.startsAt) : 'Now'} → ${c.expiresAt ? formatDate(c.expiresAt) : 'No expiry'}` },
          { title: 'Status', dataIndex: 'isActive', render: (a) => <Tag color={a ? 'green' : 'default'}>{a ? 'Active' : 'Inactive'}</Tag> },
          {
            title: '',
            width: 110,
            render: (_, c) => (
              <Space>
                <Button size="small" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(c)} aria-label="Edit" />
                <Popconfirm title="Delete this coupon?" okButtonProps={{ danger: true }} onConfirm={async () => {
                  try { await remove(c._id).unwrap(); message.success('Coupon deleted.'); } catch (err) { message.error(getErrorMessage(err)); }
                }}>
                  <Button size="small" danger icon={<Trash2 className="h-3.5 w-3.5" />} aria-label="Delete" />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <CouponModal open={editing !== undefined} coupon={editing} onClose={() => setEditing(undefined)} />
    </>
  );
}
