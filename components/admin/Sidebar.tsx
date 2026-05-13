'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { adminAuth } from '@/lib/admin-api';
import type { AdminUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface SidebarProps {
  admin: AdminUser;
}

export function Sidebar({ admin }: SidebarProps) {
  const pathname = usePathname();
  const { show } = useToast();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminAuth.logout();
      show('Signed out successfully', 'success');
      // tiny delay so user sees toast before redirect
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 400);
    } catch {
      show('Failed to logout. Please try again.', 'error');
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  const sections = [
    {
      label: 'MAIN',
      links: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
        { href: '/admin/organizations/create', label: 'Create New', icon: PlusCircle },
      ],
    },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-30">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground leading-tight">HMS Admin</span>
              <span className="text-xs text-muted-foreground">Control Panel</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const active =
                    link.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === link.href ||
                        (link.href !== '/admin/organizations/create' &&
                          pathname.startsWith(link.href) &&
                          !pathname.startsWith('/admin/organizations/create'));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{link.label}</span>
                      {active && <ChevronRight className="h-4 w-4 opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
            {admin.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={admin.picture}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {admin.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{admin.name}</p>
              <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
            </div>
            <button
              onClick={() => setLogoutOpen(true)}
              className="p-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation */}
      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Sign out of HMS Admin?"
        description={`You'll be returned to the login page. You can sign back in anytime with your authorized Google account.`}
        confirmLabel="Yes, sign me out"
        cancelLabel="Stay signed in"
        variant="logout"
        loading={loggingOut}
      />
    </>
  );
}