'use client';

import Link from 'next/link';
import { ExternalLink, Eye, KeyRound, Power, Copy } from 'lucide-react';
import type { Organization } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface Props {
  org: Organization;
  onToggleStatus: (id: number, current: 'active' | 'closed') => void;
  onRegenerateSecret: (id: number) => void;
}

export function OrganizationRow({ org, onToggleStatus, onRegenerateSecret }: Props) {
  const { show } = useToast();

  const copySecret = () => {
    if (!org.api?.client_secret) return;
    navigator.clipboard.writeText(org.api.client_secret);
    show('Client secret copied', 'success');
  };

  return (
    <tr className="border-b border-border hover:bg-accent/40 transition-colors">
      <td className="p-4">
        <div className="font-semibold text-foreground">{org.info?.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{org.info?.contact_number}</div>
        {org.info?.secondary_contact_number && (
          <div className="text-xs text-muted-foreground">
            Alt: {org.info.secondary_contact_number}
          </div>
        )}
        <div className="text-xs text-muted-foreground/70 mt-1 line-clamp-1 max-w-[260px]">
          {org.info?.address}
        </div>
      </td>
      <td className="p-4 text-sm">
        <div className="font-medium text-foreground">{org.owner?.name}</div>
        <div className="text-xs text-muted-foreground">{org.owner?.contact_number}</div>
        {org.owner?.email && (
          <div className="text-xs text-muted-foreground">{org.owner.email}</div>
        )}
      </td>
      <td className="p-4 text-sm">
        {org.api?.domain ? (
          <a
            href={`https://${org.api.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
          >
            {org.api.domain}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
        {org.api?.client_secret && (
          <button
            onClick={copySecret}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground truncate max-w-[200px] cursor-pointer"
            title="Click to copy"
          >
            <Copy className="h-3 w-3 shrink-0" />
            <span className="truncate">{org.api.client_secret}</span>
          </button>
        )}
      </td>
      <td className="p-4">
        <Badge variant={org.status === 'active' ? 'success' : 'destructive'}>
          {org.status?.toUpperCase()}
        </Badge>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/organizations/${org.id}`}
            className="p-2 rounded-md hover:bg-accent text-primary transition-colors"
            title="View / Edit"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onToggleStatus(org.id, org.status)}
            className="p-2 rounded-md hover:bg-accent text-warning transition-colors cursor-pointer"
            title="Toggle Status"
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRegenerateSecret(org.id)}
            className="p-2 rounded-md hover:bg-accent text-foreground transition-colors cursor-pointer"
            title="Regenerate Secret"
          >
            <KeyRound className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}