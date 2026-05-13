"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  User,
  KeyRound,
  Globe,
  Package,
  Sprout,
  FileText,
  Activity,
  Pencil,
  Copy,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { adminOrgs } from "@/lib/admin-api";
import type { Organization } from "@/lib/types";

export default function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orgId = parseInt(id, 10);
  const router = useRouter();
  const { show } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<
    | null
    | "info"
    | "owner"
    | "credentials"
    | "note"
    | "domain"
    | "status"
    | "packages"
    | "seeds"
  >(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminOrgs.get(orgId);
      setOrg(res.data?.organization ?? null);
    } catch {
      show("Failed to load organization", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(orgId)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleRegenerateSecret = async () => {
    if (!confirm("Regenerate client secret? Old one will stop working."))
      return;
    try {
      const res = await adminOrgs.regenerateClientSecret(orgId);
      show("New client secret generated", "success");
      alert(`New secret:\n\n${res.data?.client_secret}`);
      load();
    } catch {
      show("Failed to regenerate secret", "error");
    }
  };

  const copySecret = () => {
    if (!org?.api?.client_secret) return;
    navigator.clipboard.writeText(org.api.client_secret);
    show("Copied to clipboard", "success");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div>
        <PageHeader title="Not Found" />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium mb-2">
              Organization not found
            </p>
            <Link href="/admin/organizations">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={org.info?.name ?? "Organization"}
        subtitle={`ID: ${org.id} • Created ${new Date(org.created_at).toLocaleDateString()}`}
        breadcrumbs={[
          { label: "Organizations", href: "/admin/organizations" },
          { label: org.info?.name ?? "Edit" },
        ]}
        actions={
          <>
            <Badge
              variant={org.status === "active" ? "success" : "destructive"}
            >
              {org.status?.toUpperCase()}
            </Badge>
            <Link href="/admin/organizations">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid md:grid-cols-2 gap-4">
        <SectionCard
          icon={Building2}
          title="Organization Info"
          onEdit={() => setActiveModal("info")}
        >
          <Field label="Name" value={org.info?.name} />
          <Field label="Contact" value={org.info?.contact_number} />
          <Field
            label="Secondary Contact"
            value={org.info?.secondary_contact_number || "—"}
          />
          <Field label="Address" value={org.info?.address} />
        </SectionCard>

        <SectionCard
          icon={User}
          title="Owner Information"
          onEdit={() => setActiveModal("owner")}
        >
          <Field label="Name" value={org.owner?.name} />
          <Field label="Contact" value={org.owner?.contact_number} />
          <Field label="Email" value={org.owner?.email || "—"} />
          <Field label="Address" value={org.owner?.address} />
        </SectionCard>

        <SectionCard
          icon={KeyRound}
          title="Login Credentials"
          onEdit={() => setActiveModal("credentials")}
        >
          {org.credentials ? (
            <>
              <Field label="Name" value={org.credentials.name} />
              <Field label="Email" value={org.credentials.email} />
              <Field label="Phone" value={org.credentials.phone_number} />
              <Field label="Password" value="••••••••" />
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No credentials set</p>
          )}
        </SectionCard>

        <SectionCard icon={Globe} title="API Access">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Domain
              </span>
              {org.api?.domain ? (
                <a
                  href={`https://${org.api.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {org.api.domain}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>

            {org.api?.client_secret && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-muted-foreground">
                    Client Secret
                  </span>
                  <button
                    onClick={copySecret}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
                <code className="block text-xs text-foreground bg-muted px-3 py-2 rounded-md break-all font-mono">
                  {org.api.client_secret}
                </code>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setActiveModal("domain")}
              >
                <Pencil className="h-3.5 w-3.5" />
                Update Domain
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={handleRegenerateSecret}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Package}
          title="Packages"
          onEdit={() => setActiveModal("packages")}
        >
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(org.packages || {}).map(([key, val]) => (
              <Badge
                key={key}
                variant={val === "activate" ? "success" : "destructive"}
                className="capitalize"
              >
                {key}
              </Badge>
            ))}
            {Object.keys(org.packages || {}).length === 0 && (
              <p className="text-sm text-muted-foreground">No packages</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          icon={Sprout}
          title="Seeds"
          onEdit={() => setActiveModal("seeds")}
        >
          <div className="space-y-3">
            {Object.entries(org.seeds || {}).map(([pkg, types]) => {
              const enabled = Object.entries(types || {})
                .filter(([, v]) => v === "true" || (v as any) === true)
                .map(([k]) => k);
              return (
                <div key={pkg}>
                  <p className="text-sm font-medium capitalize text-foreground mb-1">
                    {pkg}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {enabled.length > 0 ? (
                      enabled.map((s) => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="capitalize"
                        >
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          icon={FileText}
          title="Note"
          onEdit={() => setActiveModal("note")}
        >
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {org.note || <span className="text-muted-foreground">No note</span>}
          </p>
        </SectionCard>

        <SectionCard
          icon={Activity}
          title="Status"
          onEdit={() => setActiveModal("status")}
        >
          <Badge
            variant={org.status === "active" ? "success" : "destructive"}
            className="text-sm px-3 py-1"
          >
            {org.status?.toUpperCase()}
          </Badge>
        </SectionCard>
      </div>

      {/* MODALS */}
      <UpdateInfoModal
        open={activeModal === "info"}
        onClose={() => setActiveModal(null)}
        org={org}
        onSaved={load}
      />
      <UpdateOwnerModal
        open={activeModal === "owner"}
        onClose={() => setActiveModal(null)}
        org={org}
        onSaved={load}
      />
      <UpdateCredentialsModal
        open={activeModal === "credentials"}
        onClose={() => setActiveModal(null)}
        org={org}
        onSaved={load}
      />
      <UpdateNoteModal
        open={activeModal === "note"}
        onClose={() => setActiveModal(null)}
        org={org}
        onSaved={load}
      />
      <UpdateDomainModal
        open={activeModal === "domain"}
        onClose={() => setActiveModal(null)}
        org={org}
        onSaved={load}
      />
      <UpdateStatusModal
        open={activeModal === "status"}
        onClose={() => setActiveModal(null)}
        org={org}
        onSaved={load}
      />
      <UpdatePackagesModal
        open={activeModal === "packages"}
        onClose={() => setActiveModal(null)}
        org={org}
        onSaved={load}
      />
      <UpdateSeedsModal
        open={activeModal === "seeds"}
        onClose={() => setActiveModal(null)}
        org={org}
        onSaved={load}
      />
    </div>
  );
}

/* ========== Helpers ========== */

function SectionCard({
  icon: Icon,
  title,
  children,
  onEdit,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          )}
        </div>
        <div className="space-y-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="font-medium text-muted-foreground min-w-[110px]">
        {label}:
      </span>
      <span className="text-foreground flex-1 break-words">{value || "—"}</span>
    </div>
  );
}

/* ========== MODALS ========== */

function UpdateInfoModal({ open, onClose, org, onSaved }: ModalProps) {
  const { show } = useToast();
  const [data, setData] = useState({
    name: "",
    contact_number: "",
    secondary_contact_number: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setData({
        name: org.info?.name ?? "",
        contact_number: org.info?.contact_number ?? "",
        secondary_contact_number: org.info?.secondary_contact_number ?? "",
        address: org.info?.address ?? "",
      });
    }
  }, [open, org]);

  const save = async () => {
    setLoading(true);
    try {
      await adminOrgs.updateInfo(org.id, data);
      show("Organization info updated", "success");
      onSaved();
      onClose();
    } catch {
      show("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Organization Info"
      size="md"
    >
      <div className="space-y-3">
        <Input
          label="Name"
          required
          value={data.name}
          onChange={(v) => setData({ ...data, name: v })}
        />
        <Input
          label="Contact Number"
          required
          value={data.contact_number}
          onChange={(v) => setData({ ...data, contact_number: v })}
        />
        <Input
          label="Secondary Contact"
          value={data.secondary_contact_number}
          onChange={(v) => setData({ ...data, secondary_contact_number: v })}
        />
        <Textarea
          label="Address"
          required
          value={data.address}
          onChange={(v) => setData({ ...data, address: v })}
        />
        <ModalFooter onCancel={onClose} onSave={save} loading={loading} />
      </div>
    </Modal>
  );
}

function UpdateOwnerModal({ open, onClose, org, onSaved }: ModalProps) {
  const { show } = useToast();
  const [data, setData] = useState({
    name: "",
    contact_number: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setData({
        name: org.owner?.name ?? "",
        contact_number: org.owner?.contact_number ?? "",
        email: org.owner?.email ?? "",
        address: org.owner?.address ?? "",
      });
    }
  }, [open, org]);

  const save = async () => {
    setLoading(true);
    try {
      await adminOrgs.updateOwner(org.id, data);
      show("Owner info updated", "success");
      onSaved();
      onClose();
    } catch {
      show("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Owner Info" size="md">
      <div className="space-y-3">
        <Input
          label="Name"
          required
          value={data.name}
          onChange={(v) => setData({ ...data, name: v })}
        />
        <Input
          label="Contact"
          required
          value={data.contact_number}
          onChange={(v) => setData({ ...data, contact_number: v })}
        />
        <Input
          label="Email"
          type="email"
          value={data.email}
          onChange={(v) => setData({ ...data, email: v })}
        />
        <Input
          label="Address"
          required
          value={data.address}
          onChange={(v) => setData({ ...data, address: v })}
        />
        <ModalFooter onCancel={onClose} onSave={save} loading={loading} />
      </div>
    </Modal>
  );
}

function UpdateCredentialsModal({ open, onClose, org, onSaved }: ModalProps) {
  const { show } = useToast();
  const [data, setData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setData({
        name: org.credentials?.name ?? "",
        email: org.credentials?.email ?? "",
        phone_number: org.credentials?.phone_number ?? "",
        password: "",
      });
    }
  }, [open, org]);

  const save = async () => {
    setLoading(true);
    try {
      await adminOrgs.updateCredentials(org.id, data);
      show("Credentials updated", "success");
      onSaved();
      onClose();
    } catch {
      show("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Login Credentials"
      size="md"
    >
      <div className="space-y-3">
        <Input
          label="Name"
          required
          value={data.name}
          onChange={(v) => setData({ ...data, name: v })}
        />
        <Input
          label="Email"
          type="email"
          required
          value={data.email}
          onChange={(v) => setData({ ...data, email: v })}
        />
        <Input
          label="Phone"
          required
          value={data.phone_number}
          onChange={(v) => setData({ ...data, phone_number: v })}
        />
        <Input
          label="Password (leave empty to keep current)"
          type="text"
          value={data.password}
          onChange={(v) => setData({ ...data, password: v })}
        />
        <ModalFooter onCancel={onClose} onSave={save} loading={loading} />
      </div>
    </Modal>
  );
}

function UpdateNoteModal({ open, onClose, org, onSaved }: ModalProps) {
  const { show } = useToast();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setNote(org.note ?? "");
  }, [open, org]);

  const save = async () => {
    setLoading(true);
    try {
      await adminOrgs.updateNote(org.id, note);
      show("Note updated", "success");
      onSaved();
      onClose();
    } catch {
      show("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Note" size="md">
      <Textarea
        label="Internal Note"
        value={note}
        onChange={setNote}
        rows={6}
      />
      <ModalFooter onCancel={onClose} onSave={save} loading={loading} />
    </Modal>
  );
}

function UpdateDomainModal({ open, onClose, org, onSaved }: ModalProps) {
  const { show } = useToast();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setDomain(org.api?.domain ?? "");
  }, [open, org]);

  const save = async () => {
    setLoading(true);
    try {
      await adminOrgs.updateDomain(org.id, domain);
      show("Domain updated", "success");
      onSaved();
      onClose();
    } catch (e: any) {
      show(e.response?.data?.message ?? "Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Domain" size="md">
      <div className="space-y-3">
        <Input
          label="Domain (without https://)"
          value={domain}
          onChange={setDomain}
          placeholder="example.com"
        />
        <div className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-md p-2.5">
          ⚠ Must not include <code className="font-mono">http://</code> or{" "}
          <code className="font-mono">https://</code>
        </div>
        <ModalFooter onCancel={onClose} onSave={save} loading={loading} />
      </div>
    </Modal>
  );
}

function UpdateStatusModal({ open, onClose, org, onSaved }: ModalProps) {
  const { show } = useToast();
  const [status, setStatus] = useState<"active" | "closed">("active");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setStatus(org.status ?? "active");
  }, [open, org]);

  const save = async () => {
    setLoading(true);
    try {
      await adminOrgs.updateStatus(org.id, status);
      show("Status updated", "success");
      onSaved();
      onClose();
    } catch {
      show("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Status" size="md">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setStatus("active")}
            className={`px-4 py-3 rounded-md text-sm font-medium border transition-all cursor-pointer ${
              status === "active"
                ? "bg-success/10 border-success text-success"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            ACTIVE
          </button>
          <button
            type="button"
            onClick={() => setStatus("closed")}
            className={`px-4 py-3 rounded-md text-sm font-medium border transition-all cursor-pointer ${
              status === "closed"
                ? "bg-destructive/10 border-destructive text-destructive"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            CLOSED
          </button>
        </div>
        <ModalFooter
          onCancel={onClose}
          onSave={save}
          loading={loading}
          saveLabel="Update Status"
        />
      </div>
    </Modal>
  );
}

function UpdatePackagesModal({ open, onClose, org, onSaved }: ModalProps) {
  const { show } = useToast();
  const [packages, setPackages] = useState<
    Record<string, "activate" | "deactivate">
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setPackages({ ...(org.packages ?? {}) });
  }, [open, org]);

  const toggle = (name: string) =>
    setPackages((p) => ({
      ...p,
      [name]: p[name] === "activate" ? "deactivate" : "activate",
    }));

  const save = async () => {
    setLoading(true);
    try {
      await adminOrgs.updatePackages(org.id, packages);
      show("Packages updated", "success");
      onSaved();
      onClose();
    } catch {
      show("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Packages" size="lg">
      <div className="flex flex-wrap gap-2">
        {Object.keys(packages).map((pkg) => {
          const active = packages[pkg] === "activate";
          return (
            <button
              type="button"
              key={pkg}
              onClick={() => toggle(pkg)}
              className={`px-3.5 py-2 rounded-md text-sm font-medium border transition-all capitalize cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              }`}
            >
              {pkg}
            </button>
          );
        })}
      </div>
      <ModalFooter onCancel={onClose} onSave={save} loading={loading} />
    </Modal>
  );
}

function UpdateSeedsModal({ open, onClose, org, onSaved }: ModalProps) {
  const { show } = useToast();
  const [seeds, setSeeds] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setSeeds(JSON.parse(JSON.stringify(org.seeds ?? {})));
  }, [open, org]);

  const toggle = (pkg: string, seed: string) =>
    setSeeds((s) => ({
      ...s,
      [pkg]: {
        ...(s[pkg] ?? {}),
        [seed]: s[pkg]?.[seed] === "true" ? "false" : "true",
      },
    }));

  const save = async () => {
    setLoading(true);
    try {
      await adminOrgs.updateSeeds(org.id, seeds);
      show("Seeds updated", "success");
      onSaved();
      onClose();
    } catch {
      show("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Seeds" size="lg">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {Object.keys(seeds).map((pkg) => (
          <div
            key={pkg}
            className="border border-border rounded-lg p-4 bg-muted/30"
          >
            <h4 className="font-semibold capitalize text-sm mb-3 text-foreground">
              {pkg}
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(seeds[pkg] ?? {}).map((seed) => {
                const checked = seeds[pkg][seed] === "true";
                return (
                  <button
                    type="button"
                    key={seed}
                    onClick={() => toggle(pkg, seed)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer capitalize ${
                      checked
                        ? "bg-success/10 text-success border-success/40"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
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
      <ModalFooter onCancel={onClose} onSave={save} loading={loading} />
    </Modal>
  );
}

/* ========== Modal Helpers ========== */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  org: Organization;
  onSaved: () => void;
}

function ModalFooter({
  onCancel,
  onSave,
  loading,
  saveLabel = "Save Changes",
}: {
  onCancel: () => void;
  onSave: () => void;
  loading?: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button variant="primary" loading={loading} onClick={onSave}>
        {saveLabel}
      </Button>
    </div>
  );
}
