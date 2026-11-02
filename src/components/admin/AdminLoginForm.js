'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Card, Form, Input } from 'antd';
import BrandMark from '@/components/brand/BrandMark';
import { loginSchema } from '@/lib/validation/auth';
import { useAdminLoginMutation } from '@/store/api/adminApi';
import { getErrorMessage } from '@/lib/utils/errors';
import { RHFItem } from './rhf';

export default function AdminLoginForm() {
  const router = useRouter();
  const [login, { isLoading }] = useAdminLoginMutation();
  const [error, setError] = useState(null);
  const { control, handleSubmit } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setError(null);
    try {
      await login(values).unwrap();
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <main id="main" className="bg-grid flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm" variant="outlined">
        <div className="mb-6 flex items-center gap-3">
          <BrandMark className="h-8 w-auto text-mist-50" />
          <div>
            <h1 className="font-display text-lg font-semibold text-mist-50">ZEOTON Admin</h1>
            <p className="text-xs text-mist-400">Authorised staff only</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Form layout="vertical" component="div">
            <RHFItem control={control} name="email" label="Email" required render={(p) => <Input {...p} type="email" autoComplete="username" size="large" />} />
            <RHFItem control={control} name="password" label="Password" required render={(p) => <Input.Password {...p} autoComplete="current-password" size="large" />} />
            {error && <Alert type="error" title={error} showIcon className="mb-4" />}
            <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
              Sign in
            </Button>
          </Form>
        </form>
      </Card>
    </main>
  );
}
