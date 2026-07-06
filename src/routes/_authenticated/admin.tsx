import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Download, Search, LogOut, ShieldAlert } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

const STATUSES = ["New", "Contacted", "Qualified", "Won", "Lost", "Archived"] as const;

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      setUserEmail(data.user.email ?? "");
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roleRow);
    })();
  }, [navigate]);

  const leadsQuery = useQuery({
    queryKey: ["leads"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const filtered = useMemo(() => {
    const rows = leadsQuery.data ?? [];
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.business_name?.toLowerCase().includes(q) ||
        r.full_name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.industry?.toLowerCase().includes(q) ||
        r.budget?.toLowerCase().includes(q)
      );
    });
  }, [leadsQuery.data, search, statusFilter]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function exportCSV() {
    const rows = filtered;
    if (!rows.length) return toast.error("Nothing to export");
    const cols = [
      "created_at",
      "status",
      "business_name",
      "full_name",
      "email",
      "phone",
      "whatsapp",
      "industry",
      "website",
      "city",
      "country",
      "business_size",
      "budget",
      "timeline",
      "preferred_contact",
      "current_problems",
      "online_presence",
      "services_required",
      "project_goals",
      "assigned_to",
      "last_contacted",
      "admin_notes",
    ] as const;
    const esc = (v: unknown) => {
      if (v == null) return "";
      const s = Array.isArray(v) ? v.join("; ") : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const csv = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `techilla-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-serif text-2xl text-foreground">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="text-foreground">{userEmail}</span>. This account has not
            been granted admin. Ask the site owner to grant your account admin access.
          </p>
          <Button variant="outline" className="mt-6" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Techilla · Admin
            </div>
            <h1 className="mt-1 font-serif text-2xl">Leads</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">{userEmail}</span>
            <Button size="sm" variant="ghost" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search business, name, email, industry, budget…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        {leadsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : leadsQuery.error ? (
          <p className="text-sm text-destructive">
            Failed to load leads: {(leadsQuery.error as Error).message}
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
            <p className="text-sm text-muted-foreground">No leads match your filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{lead.business_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.industry || "—"} · {lead.city || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{lead.full_name}</div>
                      <div className="text-xs text-muted-foreground">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.budget || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.length} of {leadsQuery.data?.length ?? 0} leads
        </p>
      </div>

      <LeadDrawer
        lead={selected}
        onClose={() => setSelected(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ["leads"] })}
      />
    </div>
  );
}

function LeadDrawer({
  lead,
  onClose,
  onSaved,
}: {
  lead: Lead | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<string>("New");
  const [notes, setNotes] = useState("");
  const [assigned, setAssigned] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setNotes(lead.admin_notes ?? "");
      setAssigned(lead.assigned_to ?? "");
    }
  }, [lead]);

  async function save() {
    if (!lead) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status,
          admin_notes: notes || null,
          assigned_to: assigned || null,
          last_contacted: new Date().toISOString(),
        })
        .eq("id", lead.id);
      if (error) throw error;
      toast.success("Lead updated");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle className="font-serif text-2xl">{lead.business_name}</SheetTitle>
              <SheetDescription>
                Received {new Date(lead.created_at).toLocaleString()}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6 text-sm">
              <Section title="Contact">
                <Field label="Full name" value={lead.full_name} />
                <Field label="Email" value={lead.email} />
                <Field label="Phone" value={lead.phone} />
                <Field label="WhatsApp" value={lead.whatsapp} />
                <Field label="Preferred contact" value={lead.preferred_contact} />
              </Section>

              <Section title="Business">
                <Field label="Industry" value={lead.industry} />
                <Field label="Website" value={lead.website} />
                <Field label="Location" value={[lead.city, lead.country].filter(Boolean).join(", ")} />
                <Field label="Size" value={lead.business_size} />
                <Field label="Online presence" value={lead.online_presence?.join(", ")} />
              </Section>

              <Section title="Project">
                <Field label="Services" value={lead.services_required?.join(", ")} />
                <Field label="Goals" value={lead.project_goals?.join(", ")} />
                <Field label="Budget" value={lead.budget} />
                <Field label="Timeline" value={lead.timeline} />
                <Field label="Problems" value={lead.current_problems} multiline />
              </Section>

              <Section title="Admin">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned to</Label>
                  <Input value={assigned} onChange={(e) => setAssigned(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <Button onClick={save} disabled={saving} className="w-full">
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={multiline ? "mt-0.5 whitespace-pre-wrap" : "mt-0.5"}>{value}</div>
    </div>
  );
}
