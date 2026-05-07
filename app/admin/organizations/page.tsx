'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, X, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { OrganizationRow } from '@/components/admin/OrganizationRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminOrgs } from '@/lib/admin-api';
import { useToast } from '@/components/ui/Toast';
import type { Organization, Pagination } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function OrganizationsPage() {
  const { show } = useToast();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminOrgs.list({ search, page, limit: 10 });
      setOrgs(res.data?.organizations ?? []);
      setPagination(res.data?.pagination ?? null);
    } catch (e) {
      show('Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusToggle = async (id: number, current: 'active' | 'closed') => {
    const next = current === 'active' ? 'closed' : 'active';
    if (!confirm(`Change status to ${next}?`)) return;
    try {
      await adminOrgs.updateStatus(id, next);
      show(`Status updated to ${next}`, 'success');
      load(pagination?.currentPage ?? 1);
    } catch {
      show('Failed to update status', 'error');
    }
  };

  const handleRegenerateSecret = async (id: number) => {
    if (!confirm('Regenerate client secret? Old one will stop working.')) return;
    try {
      const res = await adminOrgs.regenerateClientSecret(id);
      show('New client secret generated', 'success');
      alert(`New secret:\n\n${res.data?.client_secret}`);
      load(pagination?.currentPage ?? 1);
    } catch {
      show('Failed to regenerate secret', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="All Organizations"
        subtitle="Manage organizations onboarded to HMS"
        breadcrumbs={[{ label: 'Organizations' }]}
        actions={
          <Link href="/admin/organizations/create">
            <Button variant="primary">
              <Plus className="h-4 w-4" />
              New Organization
            </Button>
          </Link>
        }
      />

      {/* Search bar */}
      <Card className="p-3 mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(1)}
            placeholder="Search by name, contact, owner, domain..."
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button variant="primary" onClick={() => load(1)}>
          Search
        </Button>
        {search && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setTimeout(() => load(1), 0);
            }}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground mt-3">Loading organizations...</p>
          </div>
        ) : orgs.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No organizations found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? 'Try a different search term.' : 'Create your first organization to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <Th>Organization</Th>
                  <Th>Owner</Th>
                  <Th>Domain / API</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <OrganizationRow
                    key={org.id}
                    org={org}
                    onToggleStatus={handleStatusToggle}
                    onRegenerateSecret={handleRegenerateSecret}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            Showing page <span className="font-medium text-foreground">{pagination.currentPage}</span> of{' '}
            <span className="font-medium text-foreground">{pagination.totalPages}</span> ·{' '}
            <span className="font-medium text-foreground">{pagination.total}</span> total
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.currentPage === 1}
              onClick={() => load(pagination.currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.currentPage) <= 1
              )
              .map((p, i, arr) => {
                const showDots = i > 0 && p - arr[i - 1] > 1;
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showDots && <span className="text-muted-foreground px-1">…</span>}
                    <button
                      onClick={() => load(p)}
                      className={cn(
                        'h-9 min-w-9 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer',
                        p === pagination.currentPage
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-accent'
                      )}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => load(pagination.currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="p-4 text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
      {children}
    </th>
  );
}