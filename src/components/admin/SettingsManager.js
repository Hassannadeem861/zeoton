'use client';

import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, App, Button, Card, Form, Input, InputNumber, Radio, Skeleton, Switch, Tabs } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import { settingsSchemas } from '@/lib/validation/settings';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/api/adminApi';
import { getErrorMessage } from '@/lib/utils/errors';
import { RHFItem, setServerErrors } from './rhf';
import PageTitle from './PageTitle';

const pkr = { min: 0, precision: 0, prefix: 'Rs', style: { width: '100%' } };

function useSection(key, defaults) {
  const { message } = App.useApp();
  const [save, { isLoading }] = useUpdateSettingsMutation();
  const form = useForm({ resolver: zodResolver(settingsSchemas[key]), values: defaults });
  const onSubmit = form.handleSubmit(async (value) => {
    try {
      await save({ key, value }).unwrap();
      message.success('Saved. The storefront has been refreshed.');
    } catch (err) {
      if (!setServerErrors(err, form.setError)) message.error(getErrorMessage(err));
    }
  });
  return { ...form, onSubmit, isLoading };
}

function SaveBar({ loading }) {
  return (
    <div className="mt-2 flex justify-end">
      <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
    </div>
  );
}

function StoreSection({ value }) {
  const { control, onSubmit, isLoading } = useSection('store', value);
  const mode = useWatch({ control, name: 'shipping.mode' });
  return (
    <form onSubmit={onSubmit} noValidate>
      <Form layout="vertical" component="div">
        <Card title="Shipping" className="mb-4">
          <RHFItem control={control} name="shipping.mode" label="Shipping charges" render={(p) => (
            <Radio.Group {...p} options={[
              { value: 'pending', label: 'Not decided yet (set per order)' },
              { value: 'flat', label: 'Flat fee' },
              { value: 'free', label: 'Free shipping' },
            ]} />
          )} />
          {mode === 'flat' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <RHFItem control={control} name="shipping.flatFee" label="Flat fee per order" required render={(p) => <InputNumber {...pkr} {...p} />} />
              <RHFItem control={control} name="shipping.freeShippingThreshold" label="Free shipping from (optional)" render={(p) => <InputNumber {...pkr} {...p} placeholder="No free threshold" />} />
            </div>
          )}
          {mode === 'pending' && <Alert type="info" showIcon className="mb-4" title="Checkout shows “Shipping: to be confirmed”. Set the charge on each order from the order page." />}
          <RHFItem control={control} name="shipping.coverageText" label="Delivery coverage text" render={(p) => <Input {...p} maxLength={200} />} />
          <RHFItem control={control} name="shipping.deliveryTimeText" label="Delivery time text" extra="Leave empty until delivery times are decided." render={(p) => <Input {...p} maxLength={200} placeholder="e.g. 3–5 working days in major cities" />} />
        </Card>
        <Card title="Payment" className="mb-4">
          <RHFItem control={control} name="payment.codEnabled" label="Cash on Delivery enabled" checkbox render={(p) => <Switch {...p} />} />
          <RHFItem control={control} name="payment.bankQrEnabled" label="Meezan Bank QR enabled" checkbox render={(p) => <Switch {...p} />} />
          <RHFItem control={control} name="payment.codNote" label="Note shown at checkout" render={(p) => <Input {...p} maxLength={300} />} />
          <p className="text-xs text-mist-400">Online payments (JazzCash, Easypaisa, cards) are not integrated yet; they can be added later through the payment provider registry.</p>
        </Card>
        <Card title="Inventory">
          <RHFItem control={control} name="lowStockDefault" label="Default low-stock alert level" render={(p) => <InputNumber {...p} min={0} precision={0} />} />
        </Card>
        <SaveBar loading={isLoading} />
      </Form>
    </form>
  );
}

function PoliciesSection({ value }) {
  const { control, onSubmit, isLoading } = useSection('policies', value);
  const help = 'Blank line = new paragraph · "## " = heading · "- " = bullet point. Leave empty to show a "being finalised" notice.';
  return (
    <form onSubmit={onSubmit} noValidate>
      <Form layout="vertical" component="div">
        <Card className="mb-4">
          <RHFItem control={control} name="shippingPolicy" label="Additional shipping policy text" extra={help} render={(p) => <Input.TextArea {...p} rows={10} />} />
          <RHFItem control={control} name="returnsPolicy" label="Returns & exchanges policy" extra={`${help} The page is hidden from search engines until this is filled in.`} render={(p) => <Input.TextArea {...p} rows={12} />} />
        </Card>
        <SaveBar loading={isLoading} />
      </Form>
    </form>
  );
}

function ContentSection({ value }) {
  const { control, onSubmit, isLoading } = useSection('content', value);
  return (
    <form onSubmit={onSubmit} noValidate>
      <Form layout="vertical" component="div">
        <Card title="Announcement bar" className="mb-4">
          <RHFItem control={control} name="announcement.enabled" label="Show announcement" checkbox render={(p) => <Switch {...p} />} />
          <RHFItem control={control} name="announcement.text" label="Text" render={(p) => <Input {...p} maxLength={160} showCount />} />
          <RHFItem control={control} name="announcement.href" label="Link (optional)" render={(p) => <Input {...p} placeholder="/products" />} />
        </Card>
        <Card title="Home page hero" className="mb-4">
          <RHFItem control={control} name="hero.eyebrow" label="Small label" render={(p) => <Input {...p} maxLength={60} />} />
          <RHFItem control={control} name="hero.title" label="Headline" required render={(p) => <Input {...p} maxLength={90} showCount />} />
          <RHFItem control={control} name="hero.subtitle" label="Subtitle" render={(p) => <Input.TextArea {...p} rows={3} maxLength={260} showCount />} />
          <div className="grid gap-4 sm:grid-cols-2">
            <RHFItem control={control} name="hero.ctaLabel" label="Button label" render={(p) => <Input {...p} maxLength={30} />} />
            <RHFItem control={control} name="hero.ctaHref" label="Button link" render={(p) => <Input {...p} />} />
          </div>
        </Card>
        <Card title="About page">
          <RHFItem control={control} name="about" label="About text" extra="Only factual information about the business. Leave empty to use the default short description." render={(p) => <Input.TextArea {...p} rows={10} />} />
        </Card>
        <SaveBar loading={isLoading} />
      </Form>
    </form>
  );
}

function FaqSection({ value }) {
  const { control, onSubmit, isLoading } = useSection('faq', value);
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  return (
    <form onSubmit={onSubmit} noValidate>
      <Form layout="vertical" component="div">
        {fields.map((f, i) => (
          <Card key={f.id} size="small" className="mb-3" title={`Question ${i + 1}`} extra={<Button type="text" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => remove(i)} aria-label="Remove question" />}>
            <RHFItem control={control} name={`items.${i}.question`} label="Question" render={(p) => <Input {...p} maxLength={200} />} />
            <RHFItem control={control} name={`items.${i}.answer`} label="Answer" render={(p) => <Input.TextArea {...p} rows={3} maxLength={2000} />} />
          </Card>
        ))}
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => append({ question: '', answer: '' })}>Add question</Button>
        <SaveBar loading={isLoading} />
      </Form>
    </form>
  );
}

function SeoSection({ value }) {
  const { control, onSubmit, isLoading } = useSection('seo', value);
  const { fields, append, remove } = useFieldArray({ control, name: 'socialLinks' });
  return (
    <form onSubmit={onSubmit} noValidate>
      <Form layout="vertical" component="div">
        <Card title="Home page" className="mb-4">
          <RHFItem control={control} name="homeTitle" label="SEO title" extra="Default: “Gaming Accessories in Pakistan | ZEOTON”." render={(p) => <Input {...p} maxLength={70} showCount />} />
          <RHFItem control={control} name="homeDescription" label="Meta description" render={(p) => <Input.TextArea {...p} rows={3} maxLength={160} showCount />} />
          <RHFItem control={control} name="googleSiteVerification" label="Google Search Console verification code" render={(p) => <Input {...p} placeholder="content value of the google-site-verification meta tag" />} />
        </Card>
        <Card title="Social profiles" extra={<Button size="small" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => append({ label: '', url: '' })}>Add</Button>}>
          <p className="mb-3 text-xs text-mist-400">Only add profiles that exist. They appear in the footer and in Organization structured data.</p>
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <RHFItem control={control} name={`socialLinks.${i}.label`} render={(p) => <Input {...p} placeholder="Instagram" />} />
              <RHFItem control={control} name={`socialLinks.${i}.url`} render={(p) => <Input {...p} placeholder="https://…" />} />
              <Button type="text" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => remove(i)} aria-label="Remove link" />
            </div>
          ))}
        </Card>
        <SaveBar loading={isLoading} />
      </Form>
    </form>
  );
}

export default function SettingsManager() {
  const { data, isLoading, isError } = useGetSettingsQuery();
  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (isError || !data) return <Alert type="error" title="Could not load settings." />;
  return (
    <>
      <PageTitle title="Settings & content" description="Business policies and website content. Changes refresh the storefront immediately." />
      <Tabs
        items={[
          { key: 'store', label: 'Shipping & payment', children: <StoreSection value={data.store} /> },
          { key: 'policies', label: 'Policies', children: <PoliciesSection value={data.policies} /> },
          { key: 'content', label: 'Website content', children: <ContentSection value={data.content} /> },
          { key: 'faq', label: 'FAQ', children: <FaqSection value={data.faq} /> },
          { key: 'seo', label: 'SEO', children: <SeoSection value={data.seo} /> },
        ]}
      />
    </>
  );
}
