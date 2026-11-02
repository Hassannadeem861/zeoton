'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, App, Button, Card, Col, Form, Input, InputNumber, Row, Select, Switch } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import { productSchema } from '@/lib/validation/admin';
import { useCreateProductMutation, useGetAdminCategoriesQuery, useUpdateProductMutation } from '@/store/api/adminApi';
import { getErrorMessage } from '@/lib/utils/errors';
import { slugify } from '@/lib/utils/format';
import { RHFItem, setServerErrors } from './rhf';
import ImageUploader from './ImageUploader';
import PageTitle from './PageTitle';

const pkr = { style: { width: '100%' }, min: 0, step: 100, precision: 0, prefix: 'Rs' };

function toFormValues(p) {
  return {
    name: p?.name || '',
    slug: p?.slug || '',
    sku: p?.sku || '',
    category: p?.category || undefined,
    subcategory: p?.subcategory || null,
    brand: p?.brand || '',
    shortDescription: p?.shortDescription || '',
    description: p?.description || '',
    specs: p?.specs || [],
    images: p?.images || [],
    price: p?.price ?? null,
    salePrice: p?.salePrice ?? null,
    stock: p?.stock ?? 0,
    lowStockThreshold: p?.lowStockThreshold ?? 5,
    variants: (p?.variants || []).map((v) => ({ _id: v._id, label: v.label, sku: v.sku, price: v.price ?? null, salePrice: v.salePrice ?? null, stock: v.stock ?? 0 })),
    tags: p?.tags || [],
    isActive: p?.isActive ?? true,
    isFeatured: p?.isFeatured ?? false,
    seo: { title: p?.seo?.title || '', description: p?.seo?.description || '' },
  };
}

export default function ProductForm({ product }) {
  const router = useRouter();
  const { message } = App.useApp();
  const { data: categories = [] } = useGetAdminCategoriesQuery();
  const [create, { isLoading: creating }] = useCreateProductMutation();
  const [update, { isLoading: updating }] = useUpdateProductMutation();
  const isEdit = !!product;

  const { control, handleSubmit, setError, setValue, getValues, formState } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: toFormValues(product),
  });
  const specs = useFieldArray({ control, name: 'specs' });
  const variants = useFieldArray({ control, name: 'variants', keyName: 'key' });
  const [categoryId, variantList, name] = useWatch({ control, name: ['category', 'variants', 'name'] });

  const parents = categories.filter((c) => !c.parent);
  const subs = categories.filter((c) => c.parent === categoryId);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await update({ id: product._id, ...values }).unwrap();
        message.success('Product saved. The storefront has been refreshed.');
      } else {
        const res = await create(values).unwrap();
        message.success('Product created.');
        router.replace(`/admin/products/${res.product._id}`);
      }
    } catch (err) {
      if (!setServerErrors(err, setError)) message.error(getErrorMessage(err));
      else message.error('Please fix the highlighted fields.');
    }
  };

  const errorCount = Object.keys(formState.errors).length;

  return (
    <form onSubmit={handleSubmit(onSubmit, () => message.error('Please fix the highlighted fields.'))} noValidate>
      <PageTitle
        title={isEdit ? `Edit: ${product.name}` : 'New product'}
        extra={
          <>
            {isEdit && <Link href={`/product/${product.slug}`} target="_blank"><Button>View on store</Button></Link>}
            <Link href="/admin/products"><Button>Back</Button></Link>
            <Button type="primary" htmlType="submit" loading={creating || updating}>{isEdit ? 'Save changes' : 'Create product'}</Button>
          </>
        }
      />
      {product?.isDemo && <Alert type="warning" showIcon className="mb-4" title="Demo product: placeholder content for design review. Remove all demo data with npm run demo:remove." />}
      {errorCount > 0 && <Alert type="error" showIcon className="mb-4" title="Some fields need attention." />}
      <Form layout="vertical" component="div">
        <Row gutter={16}>
          <Col xs={24} xl={16}>
            <Card title="Details" className="mb-4">
              <RHFItem control={control} name="name" label="Product name" required render={(p) => <Input {...p} maxLength={140} onBlur={(e) => { p.onBlur(); if (!getValues('slug')) setValue('slug', slugify(e.target.value)); }} />} />
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <RHFItem control={control} name="slug" label="URL slug" extra={`/product/${getValues('slug') || slugify(name) || '…'}`} render={(p) => <Input {...p} placeholder="auto from name" />} />
                </Col>
                <Col xs={24} md={12}>
                  <RHFItem control={control} name="sku" label="SKU" required render={(p) => <Input {...p} style={{ textTransform: 'uppercase' }} />} />
                </Col>
                <Col xs={24} md={12}>
                  <RHFItem control={control} name="category" label="Category" required render={(p) => (
                    <Select {...p} value={p.value || undefined} placeholder="Select category" options={parents.map((c) => ({ value: c._id, label: c.name }))} onChange={(v) => { p.onChange(v); setValue('subcategory', null); }} />
                  )} />
                </Col>
                <Col xs={24} md={12}>
                  <RHFItem control={control} name="subcategory" label="Subcategory" render={(p) => (
                    <Select {...p} value={p.value || undefined} allowClear disabled={!subs.length} placeholder={subs.length ? 'Optional' : 'No subcategories'} options={subs.map((c) => ({ value: c._id, label: c.name }))} onChange={(v) => p.onChange(v || null)} />
                  )} />
                </Col>
                <Col xs={24} md={12}>
                  <RHFItem control={control} name="brand" label="Brand" render={(p) => <Input {...p} maxLength={60} />} />
                </Col>
                <Col xs={24} md={12}>
                  <RHFItem control={control} name="tags" label="Search tags" extra="Extra words shoppers may search for (e.g. wireless, rgb)." render={(p) => <Select {...p} mode="tags" tokenSeparators={[',']} />} />
                </Col>
              </Row>
              <RHFItem control={control} name="shortDescription" label="Short description" extra="Shown near the price. Keep it factual." render={(p) => <Input.TextArea {...p} rows={2} maxLength={300} showCount />} />
              <RHFItem control={control} name="description" label="Full description" extra="Write a unique description. Separate paragraphs with a blank line." render={(p) => <Input.TextArea {...p} rows={8} maxLength={10000} showCount />} />
            </Card>

            <Card title="Images" className="mb-4">
              <RHFItem control={control} name="images" render={(p) => <ImageUploader value={p.value} onChange={p.onChange} />} />
            </Card>

            <Card title="Specifications" className="mb-4" extra={<Button size="small" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => specs.append({ label: '', value: '' })}>Add</Button>}>
              {specs.fields.length === 0 && <p className="text-sm text-mist-400">Add only verified specifications from the manufacturer.</p>}
              {specs.fields.map((f, i) => (
                <Row key={f.id} gutter={8} align="top">
                  <Col span={9}><RHFItem control={control} name={`specs.${i}.label`} render={(p) => <Input {...p} placeholder="e.g. Sensor" />} /></Col>
                  <Col span={13}><RHFItem control={control} name={`specs.${i}.value`} render={(p) => <Input {...p} placeholder="e.g. Optical, 26,000 DPI" />} /></Col>
                  <Col span={2}><Button type="text" danger onClick={() => specs.remove(i)} icon={<Trash2 className="h-4 w-4" />} aria-label="Remove specification" /></Col>
                </Row>
              ))}
            </Card>

            <Card title="Variants" className="mb-4" extra={<Button size="small" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => variants.append({ label: '', sku: '', price: null, salePrice: null, stock: 0 })}>Add variant</Button>}>
              <p className="mb-3 text-sm text-mist-400">Use variants for options such as colour or switch type. Each variant has its own SKU and stock. Leave price empty to use the product price.</p>
              {variants.fields.map((f, i) => (
                <Row key={f.key} gutter={8} align="top">
                  <Col xs={12} md={6}><RHFItem control={control} name={`variants.${i}.label`} label={i === 0 ? 'Label' : undefined} render={(p) => <Input {...p} placeholder="Black / Red switch" />} /></Col>
                  <Col xs={12} md={5}><RHFItem control={control} name={`variants.${i}.sku`} label={i === 0 ? 'SKU' : undefined} render={(p) => <Input {...p} />} /></Col>
                  <Col xs={8} md={4}><RHFItem control={control} name={`variants.${i}.price`} label={i === 0 ? 'Price' : undefined} render={(p) => <InputNumber {...pkr} {...p} />} /></Col>
                  <Col xs={8} md={4}><RHFItem control={control} name={`variants.${i}.salePrice`} label={i === 0 ? 'Sale' : undefined} render={(p) => <InputNumber {...pkr} {...p} />} /></Col>
                  <Col xs={6} md={3}><RHFItem control={control} name={`variants.${i}.stock`} label={i === 0 ? 'Stock' : undefined} render={(p) => <InputNumber {...p} min={0} precision={0} style={{ width: '100%' }} />} /></Col>
                  <Col xs={2} md={2} className={i === 0 ? 'pt-[30px]' : ''}><Button type="text" danger onClick={() => variants.remove(i)} icon={<Trash2 className="h-4 w-4" />} aria-label="Remove variant" /></Col>
                </Row>
              ))}
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card title="Visibility" className="mb-4">
              <RHFItem control={control} name="isActive" label="Active (visible on store)" checkbox render={(p) => <Switch {...p} />} />
              <RHFItem control={control} name="isFeatured" label="Featured on home page" checkbox render={(p) => <Switch {...p} />} />
            </Card>
            <Card title="Pricing (PKR)" className="mb-4">
              <RHFItem control={control} name="price" label="Regular price" required render={(p) => <InputNumber {...pkr} {...p} />} />
              <RHFItem control={control} name="salePrice" label="Sale price" extra="Leave empty when not on sale." render={(p) => <InputNumber {...pkr} {...p} />} />
            </Card>
            <Card title="Inventory" className="mb-4">
              {variantList?.length ? (
                <p className="mb-3 text-sm text-mist-400">Stock is managed per variant.</p>
              ) : (
                <RHFItem control={control} name="stock" label="Stock quantity" render={(p) => <InputNumber {...p} min={0} precision={0} style={{ width: '100%' }} />} />
              )}
              <RHFItem control={control} name="lowStockThreshold" label="Low-stock alert at" render={(p) => <InputNumber {...p} min={0} precision={0} style={{ width: '100%' }} />} />
            </Card>
            <Card title="Search engine (SEO)">
              <RHFItem control={control} name="seo.title" label="SEO title" extra="Defaults to “<name> Price in Pakistan”." render={(p) => <Input {...p} maxLength={70} showCount />} />
              <RHFItem control={control} name="seo.description" label="Meta description" render={(p) => <Input.TextArea {...p} rows={3} maxLength={160} showCount />} />
            </Card>
          </Col>
        </Row>
      </Form>
    </form>
  );
}
