'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Package, Sprout, User, KeyRound, FileText } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { adminOrgs } from '@/lib/admin-api';
import type { CreateOrganizationPayload } from '@/lib/types';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<{
    defaulTOrgPackages: Record<string, 'activate' | 'deactivate'>;
    defaultSeeds: Record<string, Record<string, string>>;
  }>({ defaulTOrgPackages: {}, defaultSeeds: {} });

  const [form, setForm] = useState<CreateOrganizationPayload>({
    organization: {
      name: '',
      contact_number: '',
      secondary_contact_number: '',
      domain: '',
      address: '',
      note: '',
    },
    owner_info: { name: '', contact_number: '', email: '', address: '' },
    user: { name: '', email: '', phone_number: '', password: '' },
    packages: {},
    seeds: {},
  });

  useEffect(() => {
    adminOrgs.defaults().then((res) => {
      if (res.data) {
        setDefaults(res.data);
        setForm((f) => ({
          ...f,
          packages: res.data!.defaulTOrgPackages,
          seeds: res.data!.defaultSeeds,
        }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await adminOrgs.create(form);
      show('Organization created successfully', 'success');
      router.push('/admin/organizations');
    } catch (e: any) {
      const data = e.response?.data;
      setErrors(data?.errors ?? {});
      show(data?.message ?? 'Failed to create organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrg = (key: string, val: string) =>
    setForm((f) => ({ ...f, organization: { ...f.organization, [key]: val } }));
  const updateOwner = (key: string, val: string) =>
    setForm((f) => ({ ...f, owner_info: { ...f.owner_info, [key]: val } }));
  const updateUser = (key: string, val: string) =>
    setForm((f) => ({ ...f, user: { ...f.user, [key]: val } }));

  const togglePackage = (name: string) =>
    setForm((f) => ({
      ...f,
      packages: {
        ...f.packages,
        [name]: f.packages?.[name] === 'activate' ? 'deactivate' : 'activate',
      },
    }));

  const toggleSeed = (pkg: string, seed: string) =>
    setForm((f) => ({
      ...f,
      seeds: {
        ...f.seeds,
        [pkg]: {
          ...(f.seeds?.[pkg] ?? {}),
          [seed]: f.seeds?.[pkg]?.[seed] === 'true' ? 'false' : 'true',
        },
      },
    }));

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Create Organization"
        subtitle="Onboard a new organization to HMS"
        breadcrumbs={[
          { label: 'Organizations', href: '/admin/organizations' },
          { label: 'Create' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section icon={Building2} title="Organization Information" subtitle="Basic info about the organization">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Name"
              required
              value={form.organization.name}
              onChange={(v) => updateOrg('name', v)}
              error={errors['organization.name']}
            />
            <Input
              label="Contact Number"
              required
              value={form.organization.contact_number}
              onChange={(v) => updateOrg('contact_number', v)}
              error={errors['organization.contact_number']}
            />
            <Input
              label="Secondary Contact"
              value={form.organization.secondary_contact_number ?? ''}
              onChange={(v) => updateOrg('secondary_contact_number', v)}
            />
            <Input
              label="Domain"
              placeholder="example.com"
              value={form.organization.domain ?? ''}
              onChange={(v) => updateOrg('domain', v)}
            />
          </div>
          <Textarea
            label="Address"
            required
            value={form.organization.address}
            onChange={(v) => updateOrg('address', v)}
            error={errors['organization.address']}
          />
        </Section>

        <Section icon={Package} title="Packages" subtitle="Activate or deactivate features">
          <div className="flex flex-wrap gap-2">
            {Object.keys(defaults.defaulTOrgPackages).map((pkg) => {
              const active = form.packages?.[pkg] === 'activate';
              return (
                <button
                  type="button"
                  key={pkg}
                  onClick={() => togglePackage(pkg)}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium border transition-all cursor-pointer capitalize ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {pkg}
                </button>
              );
            })}
          </div>
        </Section>

        {Object.keys(defaults.defaultSeeds).length > 0 && (
          <Section icon={Sprout} title="Seeds" subtitle="Default data to seed for each package">
            <div className="space-y-3">
              {Object.keys(defaults.defaultSeeds).map((pkg) => (
                <div key={pkg} className="border border-border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold capitalize text-sm mb-3 text-foreground">{pkg}</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(defaults.defaultSeeds[pkg] ?? {}).map((seed) => {
                      const checked = form.seeds?.[pkg]?.[seed] === 'true';
                      return (
                        <button
                          type="button"
                          key={seed}
                          onClick={() => toggleSeed(pkg, seed)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer capitalize ${
                            checked
                              ? 'bg-success/10 text-success border-success/40'
                              : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
                          }`}
                        >
                          {seed}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section icon={User} title="Owner Information" subtitle="Person responsible for this organization">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Owner Name"
              required
              value={form.owner_info.name}
              onChange={(v) => updateOwner('name', v)}
              error={errors['owner_info.name']}
            />
            <Input
              label="Owner Contact"
              required
              value={form.owner_info.contact_number}
              onChange={(v) => updateOwner('contact_number', v)}
              error={errors['owner_info.contact_number']}
            />
            <Input
              label="Owner Email"
              type="email"
              value={form.owner_info.email ?? ''}
              onChange={(v) => updateOwner('email', v)}
            />
            <Input
              label="Owner Address"
              required
              value={form.owner_info.address}
              onChange={(v) => updateOwner('address', v)}
              error={errors['owner_info.address']}
            />
          </div>
        </Section>

        <Section icon={KeyRound} title="Default Login Credentials" subtitle="Initial credentials for the owner to log in">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Name"
              required
              value={form.user.name}
              onChange={(v) => updateUser('name', v)}
              error={errors['user.name']}
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.user.email}
              onChange={(v) => updateUser('email', v)}
              error={errors['user.email']}
            />
            <Input
              label="Phone Number"
              required
              value={form.user.phone_number}
              onChange={(v) => updateUser('phone_number', v)}
              error={errors['user.phone_number']}
            />
            <Input
              label="Password"
              type="text"
              required
              placeholder="Visible to admin only"
              value={form.user.password}
              onChange={(v) => updateUser('password', v)}
              error={errors['user.password']}
            />
          </div>
        </Section>

        <Section icon={FileText} title="Internal Note" subtitle="Optional notes (only visible to admins)">
          <Textarea
            label="Note"
            value={form.organization.note ?? ''}
            onChange={(v) => updateOrg('note', v)}
            placeholder="Any internal notes about this organization..."
            rows={4}
          />
        </Section>

        <div className="flex flex-wrap gap-2 sticky bottom-4 z-10">
          <Card className="flex-1 p-3 flex flex-wrap gap-2 justify-end shadow-lg backdrop-blur-sm bg-card/95">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create Organization
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-border">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}