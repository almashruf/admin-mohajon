'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/lib/admin-api';
import type { AdminUser } from '@/lib/types';

export function useAdmin() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAuth
      .me()
      .then((res) => {
        if (res.data?.admin) {
          setAdmin(res.data.admin);
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  return { admin, loading };
}