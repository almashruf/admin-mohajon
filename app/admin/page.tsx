'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminOrgs } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, closed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminOrgs
      .list({ limit: 100 })
      .then((res) => {
        const orgs = res.data?.organizations ?? [];
        setStats({
          total: orgs.length,
          active: orgs.filter((o) => o.status === 'active').length,
          closed: orgs.filter((o) => o.status === 'closed').length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const activeRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of your HMS onboarding platform"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Organizations"
          value={stats.total}
          icon={Building2}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          loading={loading}
          subtitle={loading ? 'Loading...' : 'Onboarded to HMS'}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={CheckCircle2}
          iconColor="text-success"
          iconBg="bg-success/10"
          loading={loading}
          subtitle={`${activeRate}% of total`}
        />
        <StatCard
          label="Closed"
          value={stats.closed}
          icon={XCircle}
          iconColor="text-destructive"
          iconBg="bg-destructive/10"
          loading={loading}
          subtitle={`${100 - activeRate}% of total`}
        />
        <StatCard
          label="Active Rate"
          value={`${activeRate}%`}
          icon={TrendingUp}
          iconColor="text-warning"
          iconBg="bg-warning/10"
          loading={loading}
          subtitle="Health indicator"
        />
      </div>

      {/* Activity overview */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Status Overview</h2>
              <p className="text-xs text-muted-foreground">Distribution of organization statuses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressRow
              label="Active"
              value={stats.active}
              total={stats.total}
              color="bg-success"
            />
            <ProgressRow
              label="Closed"
              value={stats.closed}
              total={stats.total}
              color="bg-destructive"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold text-foreground mb-1">Quick Actions</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Jump into the most common admin tasks
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/organizations" className="group">
              <div className="p-4 rounded-lg border border-border bg-background hover:border-primary hover:shadow-md transition-all flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">View Organizations</p>
                  <p className="text-xs text-muted-foreground">Browse, search, and edit</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link href="/admin/organizations/create" className="group">
              <div className="p-4 rounded-lg border border-border bg-background hover:border-primary hover:shadow-md transition-all flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusCircle className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Create Organization</p>
                  <p className="text-xs text-muted-foreground">Onboard a new client</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  subtitle,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold text-foreground">
          {loading ? <span className="opacity-30">—</span> : value}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {value} <span className="text-xs">({percent.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}