'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { App, Button, Card, Col, Form, Input, Row, Skeleton } from 'antd';
import { changePasswordSchema, profileSchema } from '@/lib/validation/auth';
import { useChangePasswordMutation, useGetMeQuery } from '@/store/api/shopApi';
import { useUpdateAdminProfileMutation } from '@/store/api/adminApi';
import { getErrorMessage } from '@/lib/utils/errors';
import { RHFItem, setServerErrors } from './rhf';
import PageTitle from './PageTitle';

function ProfileCard({ user }) {
  const { message } = App.useApp();
  const [update, { isLoading }] = useUpdateAdminProfileMutation();
  const { control, handleSubmit, setError } = useForm({ resolver: zodResolver(profileSchema), values: { name: user.name, phone: user.phone || '' } });
  return (
    <Card title="Profile">
      <form noValidate onSubmit={handleSubmit(async (v) => {
        try { await update(v).unwrap(); message.success('Profile saved.'); } catch (err) { if (!setServerErrors(err, setError)) message.error(getErrorMessage(err)); }
      })}>
        <Form layout="vertical" component="div">
          <RHFItem control={control} name="name" label="Name" required render={(p) => <Input {...p} />} />
          <RHFItem control={control} name="phone" label="Phone" render={(p) => <Input {...p} />} />
          <p className="mb-4 text-xs text-mist-400">Email: {user.email}</p>
          <Button type="primary" htmlType="submit" loading={isLoading}>Save</Button>
        </Form>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const { message } = App.useApp();
  const [change, { isLoading }] = useChangePasswordMutation();
  const { control, handleSubmit, setError, reset } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '' } });
  return (
    <Card title="Change password">
      <form noValidate onSubmit={handleSubmit(async (v) => {
        try {
          await change(v).unwrap();
          reset();
          message.success('Password changed. Other sessions were signed out.');
        } catch (err) {
          if (err?.data?.details?.field) setError(err.data.details.field, { message: err.data.message });
          else if (!setServerErrors(err, setError)) message.error(getErrorMessage(err));
        }
      })}>
        <Form layout="vertical" component="div">
          <RHFItem control={control} name="currentPassword" label="Current password" required render={(p) => <Input.Password {...p} autoComplete="current-password" />} />
          <RHFItem control={control} name="newPassword" label="New password" required extra="At least 8 characters with a letter and a number. Use a long, unique password for admin accounts." render={(p) => <Input.Password {...p} autoComplete="new-password" />} />
          <Button type="primary" htmlType="submit" loading={isLoading}>Update password</Button>
        </Form>
      </form>
    </Card>
  );
}

export default function AdminProfile() {
  const { data, isLoading } = useGetMeQuery();
  if (isLoading || !data?.user) return <Skeleton active />;
  return (
    <>
      <PageTitle title="My profile" />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}><ProfileCard user={data.user} /></Col>
        <Col xs={24} lg={12}><PasswordCard /></Col>
      </Row>
    </>
  );
}
