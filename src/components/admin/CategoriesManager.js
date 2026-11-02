'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tag } from 'antd';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { categorySchema } from '@/lib/validation/admin';
import { useCreateCategoryMutation, useDeleteCategoryMutation, useGetAdminCategoriesQuery, useUpdateCategoryMutation } from '@/store/api/adminApi';
import { getErrorMessage } from '@/lib/utils/errors';
import { RHFItem, setServerErrors } from './rhf';
import ImageUploader from './ImageUploader';
import PageTitle from './PageTitle';

const empty = { name: '', slug: '', parent: null, description: '', image: null, sortOrder: 0, isActive: true, seo: { title: '', description: '' } };

function CategoryModal({ open, category, categories, onClose }) {
  const { message } = App.useApp();
  const [create, { isLoading: c }] = useCreateCategoryMutation();
  const [update, { isLoading: u }] = useUpdateCategoryMutation();
  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(categorySchema),
    values: category
      ? { ...empty, ...category, parent: category.parent || null, image: category.image?.url ? category.image : null, seo: { title: category.seo?.title || '', description: category.seo?.description || '' } }
      : empty,
  });

  const onSubmit = async ({ ...values }) => {
    try {
      if (category) await update({ id: category._id, ...values }).unwrap();
      else await create(values).unwrap();
      message.success('Category saved.');
      onClose();
    } catch (err) {
      if (!setServerErrors(err, setError)) message.error(getErrorMessage(err));
    }
  };

  return (
    <Modal open={open} title={category ? 'Edit category' : 'New category'} onCancel={onClose} onOk={handleSubmit(onSubmit)} okText="Save" confirmLoading={c || u} destroyOnHidden width={640}>
      <Form layout="vertical" component="div">
        <RHFItem control={control} name="name" label="Name" required render={(p) => <Input {...p} />} />
        <RHFItem control={control} name="slug" label="URL slug" extra="Leave empty to generate from the name." render={(p) => <Input {...p} />} />
        <RHFItem control={control} name="parent" label="Parent category" extra="Choose a parent to make this a subcategory." render={(p) => (
          <Select {...p} value={p.value || undefined} allowClear onChange={(v) => p.onChange(v || null)} placeholder="None (top level)"
            options={categories.filter((x) => !x.parent && x._id !== category?._id).map((x) => ({ value: x._id, label: x.name }))} />
        )} />
        <RHFItem control={control} name="description" label="Description" extra="Unique intro text shown at the top of the category page." render={(p) => <Input.TextArea {...p} rows={4} maxLength={2000} showCount />} />
        <RHFItem control={control} name="image" label="Image (optional)" render={(p) => (
          <ImageUploader max={1} value={p.value ? [p.value] : []} onChange={(list) => p.onChange(list[0] || null)} />
        )} />
        <Space size="large">
          <RHFItem control={control} name="sortOrder" label="Sort order" render={(p) => <InputNumber {...p} precision={0} />} />
          <RHFItem control={control} name="isActive" label="Active" checkbox render={(p) => <Switch {...p} />} />
        </Space>
        <RHFItem control={control} name="seo.title" label="SEO title" render={(p) => <Input {...p} maxLength={70} showCount />} />
        <RHFItem control={control} name="seo.description" label="Meta description" render={(p) => <Input.TextArea {...p} rows={2} maxLength={160} showCount />} />
      </Form>
    </Modal>
  );
}

export default function CategoriesManager() {
  const { message } = App.useApp();
  const { data = [], isFetching } = useGetAdminCategoriesQuery();
  const [remove] = useDeleteCategoryMutation();
  const [editing, setEditing] = useState(undefined);
  const byId = Object.fromEntries(data.map((c) => [c._id, c]));

  return (
    <>
      <PageTitle title="Categories" description="Top-level categories appear in the navigation. Empty categories are hidden from search engines." extra={<Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(null)}>New category</Button>} />
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data}
        pagination={false}
        scroll={{ x: 700 }}
        columns={[
          { title: 'Name', dataIndex: 'name', render: (v, c) => (c.parent ? <span className="pl-4 text-mist-300">↳ {v}</span> : <strong>{v}</strong>) },
          { title: 'Slug', dataIndex: 'slug', render: (v) => <code className="text-xs">{v}</code> },
          { title: 'Parent', dataIndex: 'parent', render: (p) => byId[p]?.name || '—' },
          { title: 'Products', dataIndex: 'productCount' },
          { title: 'Order', dataIndex: 'sortOrder' },
          { title: 'Status', dataIndex: 'isActive', render: (a) => <Tag color={a ? 'green' : 'default'}>{a ? 'Active' : 'Hidden'}</Tag> },
          {
            title: '',
            width: 110,
            render: (_, c) => (
              <Space>
                <Button size="small" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(c)} aria-label="Edit" />
                <Popconfirm
                  title="Delete this category?"
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    try {
                      await remove(c._id).unwrap();
                      message.success('Category deleted.');
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
      <CategoryModal open={editing !== undefined} category={editing} categories={data} onClose={() => setEditing(undefined)} />
    </>
  );
}
