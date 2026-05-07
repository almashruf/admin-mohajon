'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicRoute =
    pathname === '/admin/login' || pathname.startsWith('/admin/auth');

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar admin={admin} />
      <main className="ml-64 p-6 md:p-8 max-w-[1600px]">{children}</main>
    </div>
  );
}