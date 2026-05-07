'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Top bar with breadcrumbs + theme toggle */}
      <div className="flex items-center justify-between mb-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/admin" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          {breadcrumbs?.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <ThemeToggle />
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}