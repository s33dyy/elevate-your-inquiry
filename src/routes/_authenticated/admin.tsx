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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Download,
  Search,
  LogOut,
  ShieldAlert,
  Plus,
  Trash2,
  Type,
  Heading2,
  Heading3,
  Quote,
  List as ListIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type JobApp = Database["public"]["Tables"]["job_applications"]["Row"];
type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

type EditorBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; lang?: string; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string };

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Won", "Lost", "Archived"] as const;
const APP_STATUSES = ["New", "Reviewing", "Shortlisted", "Interviewing", "Hired", "Rejected"] as const;

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

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

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
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
            <h1 className="mt-1 font-serif text-2xl">Dashboard</h1>
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
        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>
          <TabsContent value="leads" className="mt-6">
            <LeadsPanel />
          </TabsContent>
          <TabsContent value="applications" className="mt-6">
            <ApplicationsPanel />
          </TabsContent>
          <TabsContent value="blog" className="mt-6">
            <BlogPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ------------------------------- LEADS ---------------------------------- */

function LeadsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  const leadsQuery = useQuery({
    queryKey: ["leads"],
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

  function exportCSV() {
    const rows = filtered;
    if (!rows.length) return toast.error("Nothing to export");
    const cols = [
      "created_at","status","business_name","full_name","email","phone","whatsapp",
      "industry","website","city","country","business_size","budget","timeline",
      "preferred_contact","current_problems","online_presence","services_required",
      "project_goals","assigned_to","last_contacted","admin_notes",
    ] as const;
    downloadCSV(`techilla-leads-${today()}.csv`, cols as unknown as string[], rows as unknown as Record<string, unknown>[]);
  }

  return (
    <div>
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
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {leadsQuery.isLoading ? (
        <TableSkeleton />
      ) : leadsQuery.error ? (
        <p className="text-sm text-destructive">Failed: {(leadsQuery.error as Error).message}</p>
      ) : filtered.length === 0 ? (
        <EmptyState label="No leads match your filters." />
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
                <tr key={lead.id} onClick={() => setSelected(lead)} className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.business_name}</div>
                    <div className="text-xs text-muted-foreground">{lead.industry || "—"} · {lead.city || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{lead.full_name}</div>
                    <div className="text-xs text-muted-foreground">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.budget || "—"}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{lead.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">{filtered.length} of {leadsQuery.data?.length ?? 0} leads</p>

      <LeadDrawer lead={selected} onClose={() => setSelected(null)} onSaved={() => qc.invalidateQueries({ queryKey: ["leads"] })} />
    </div>
  );
}

function LeadDrawer({ lead, onClose, onSaved }: { lead: Lead | null; onClose: () => void; onSaved: () => void }) {
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
      const { error } = await supabase.from("leads").update({
        status,
        admin_notes: notes || null,
        assigned_to: assigned || null,
        last_contacted: new Date().toISOString(),
      }).eq("id", lead.id);
      if (error) throw error;
      toast.success("Lead updated");
      onSaved(); onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally { setSaving(false); }
  }

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle className="font-serif text-2xl">{lead.business_name}</SheetTitle>
              <SheetDescription>Received {new Date(lead.created_at).toLocaleString()}</SheetDescription>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEAD_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
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
                <Button onClick={save} disabled={saving} className="w-full">{saving ? "Saving…" : "Save changes"}</Button>
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------- APPLICATIONS ------------------------------- */

function ApplicationsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<JobApp | null>(null);

  const appsQuery = useQuery({
    queryKey: ["job_applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobApp[];
    },
  });

  const filtered = useMemo(() => {
    const rows = appsQuery.data ?? [];
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.full_name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.job_slug?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q)
      );
    });
  }, [appsQuery.data, search, statusFilter]);

  function exportCSV() {
    if (!filtered.length) return toast.error("Nothing to export");
    const cols = [
      "created_at","status","job_slug","full_name","email","phone","city",
      "linkedin","portfolio","education","experience","current_occupation",
      "joining_date","lead_strategy","why_join","resume_url","cover_letter_url","notes",
    ];
    downloadCSV(`techilla-applications-${today()}.csv`, cols, filtered as unknown as Record<string, unknown>[]);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email, role…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APP_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>

      {appsQuery.isLoading ? (
        <TableSkeleton />
      ) : appsQuery.error ? (
        <p className="text-sm text-destructive">Failed: {(appsQuery.error as Error).message}</p>
      ) : filtered.length === 0 ? (
        <EmptyState label="No applications match your filters." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} onClick={() => setSelected(a)} className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.full_name}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.job_slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.city || "—"}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{a.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">{filtered.length} of {appsQuery.data?.length ?? 0} applications</p>

      <AppDrawer app={selected} onClose={() => setSelected(null)} onSaved={() => qc.invalidateQueries({ queryKey: ["job_applications"] })} />
    </div>
  );
}

function AppDrawer({ app, onClose, onSaved }: { app: JobApp | null; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<string>("New");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!app) return;
    setStatus(app.status);
    setNotes(app.notes ?? "");
    setResumeUrl(null); setCoverUrl(null);
    (async () => {
      if (app.resume_url) {
        const { data } = await supabase.storage.from("resumes").createSignedUrl(app.resume_url, 3600);
        setResumeUrl(data?.signedUrl ?? null);
      }
      if (app.cover_letter_url) {
        const { data } = await supabase.storage.from("resumes").createSignedUrl(app.cover_letter_url, 3600);
        setCoverUrl(data?.signedUrl ?? null);
      }
    })();
  }, [app]);

  async function save() {
    if (!app) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("job_applications").update({ status, notes: notes || null }).eq("id", app.id);
      if (error) throw error;
      toast.success("Application updated");
      onSaved(); onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally { setSaving(false); }
  }

  return (
    <Sheet open={!!app} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {app && (
          <>
            <SheetHeader>
              <SheetTitle className="font-serif text-2xl">{app.full_name}</SheetTitle>
              <SheetDescription>Applied to <span className="text-foreground">{app.job_slug}</span> · {new Date(app.created_at).toLocaleString()}</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6 text-sm">
              <Section title="Contact">
                <Field label="Email" value={app.email} />
                <Field label="Phone" value={app.phone} />
                <Field label="City" value={app.city} />
                <Field label="LinkedIn" value={app.linkedin} />
                <Field label="Portfolio" value={app.portfolio} />
              </Section>
              <Section title="Background">
                <Field label="Education" value={app.education} multiline />
                <Field label="Experience" value={app.experience} multiline />
                <Field label="Current occupation" value={app.current_occupation} />
                <Field label="Joining date" value={app.joining_date} />
              </Section>
              <Section title="Answers">
                <Field label="Lead strategy" value={app.lead_strategy} multiline />
                <Field label="Why join Techilla" value={app.why_join} multiline />
              </Section>
              <Section title="Documents">
                {resumeUrl ? (
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary underline underline-offset-4">Download resume</a>
                ) : app.resume_url ? <span className="text-muted-foreground">Preparing resume link…</span> : <span className="text-muted-foreground">No resume</span>}
                <br />
                {coverUrl ? (
                  <a href={coverUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary underline underline-offset-4">Download cover letter</a>
                ) : app.cover_letter_url ? <span className="text-muted-foreground">Preparing cover-letter link…</span> : null}
              </Section>
              <Section title="Admin">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{APP_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <Button onClick={save} disabled={saving} className="w-full">{saving ? "Saving…" : "Save changes"}</Button>
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------- BLOG EDITOR ---------------------------------- */

function BlogPanel() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<BlogPostRow | "new" | null>(null);

  const postsQuery = useQuery({
    queryKey: ["blog_posts_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPostRow[];
    },
  });

  async function togglePublish(row: BlogPostRow) {
    const { error } = await supabase.from("blog_posts").update({ published: !row.published }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(row.published ? "Unpublished" : "Published");
    qc.invalidateQueries({ queryKey: ["blog_posts_admin"] });
    qc.invalidateQueries({ queryKey: ["blog_posts_public"] });
  }

  async function remove(row: BlogPostRow) {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["blog_posts_admin"] });
    qc.invalidateQueries({ queryKey: ["blog_posts_public"] });
  }

  if (editing) {
    return (
      <BlogEditor
        row={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["blog_posts_admin"] });
          qc.invalidateQueries({ queryKey: ["blog_posts_public"] });
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">Posts</h2>
          <p className="text-xs text-muted-foreground">Draft, edit, publish. Published posts appear at <span className="text-foreground">/blog</span>.</p>
        </div>
        <Button onClick={() => setEditing("new")}><Plus className="mr-2 h-4 w-4" /> New post</Button>
      </div>

      {postsQuery.isLoading ? (
        <TableSkeleton />
      ) : postsQuery.error ? (
        <p className="text-sm text-destructive">Failed: {(postsQuery.error as Error).message}</p>
      ) : !postsQuery.data?.length ? (
        <EmptyState label="No posts yet. Create your first draft." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {postsQuery.data.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3">{p.published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(p)}>
                      {p.published ? <><EyeOff className="mr-1 h-3.5 w-3.5" /> Unpublish</> : <><Eye className="mr-1 h-3.5 w-3.5" /> Publish</>}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BlogEditor({ row, onClose, onSaved }: { row: BlogPostRow | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!row;
  const [title, setTitle] = useState(row?.title ?? "");
  const [slug, setSlug] = useState(row?.slug ?? "");
  const [excerpt, setExcerpt] = useState(row?.excerpt ?? "");
  const [author, setAuthor] = useState(row?.author ?? "Techilla");
  const [dateLabel, setDateLabel] = useState(row?.date_label ?? new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }));
  const [readingTime, setReadingTime] = useState(row?.reading_time ?? "5 min read");
  const [tagsStr, setTagsStr] = useState((row?.tags ?? []).join(", "));
  const [heroImage, setHeroImage] = useState(row?.hero_image ?? "");
  const [heroAlt, setHeroAlt] = useState(row?.hero_alt ?? "");
  const [tldrStr, setTldrStr] = useState((row?.tldr ?? []).join("\n"));
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => {
    const b = (row?.blocks as unknown as EditorBlock[]) ?? [];
    return b.length ? b : [{ type: "p", text: "" }];
  });
  const [published, setPublished] = useState<boolean>(row?.published ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit && title) {
      setSlug((s) => s || slugify(title));
    }
  }, [title, isEdit]);

  function updateBlock(i: number, patch: Partial<EditorBlock>) {
    setBlocks((prev) => prev.map((b, idx) => (idx === i ? ({ ...b, ...patch } as EditorBlock) : b)));
  }
  function addBlock(type: EditorBlock["type"]) {
    const b: EditorBlock =
      type === "ul" ? { type: "ul", items: [""] }
      : type === "image" ? { type: "image", src: "", alt: "" }
      : type === "code" ? { type: "code", text: "" }
      : { type, text: "" };
    setBlocks((prev) => [...prev, b]);
  }
  function removeBlock(i: number) { setBlocks((prev) => prev.filter((_, idx) => idx !== i)); }
  function moveBlock(i: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function uploadImageFor(i: number, file: File) {
    const path = `blog/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error } = await supabase.storage.from("resumes").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) return toast.error(error.message);
    const { data } = await supabase.storage.from("resumes").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (!data?.signedUrl) return toast.error("Could not create signed URL");
    updateBlock(i, { src: data.signedUrl } as Partial<EditorBlock>);
    toast.success("Image uploaded");
  }

  async function save(publish?: boolean) {
    if (!title.trim() || !slug.trim()) return toast.error("Title and slug are required");
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        author: author.trim() || "Techilla",
        date_label: dateLabel.trim(),
        reading_time: readingTime.trim(),
        tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
        hero_image: heroImage.trim() || null,
        hero_alt: heroAlt.trim() || null,
        tldr: tldrStr.split("\n").map((l) => l.trim()).filter(Boolean),
        blocks: blocks as unknown as Database["public"]["Tables"]["blog_posts"]["Insert"]["blocks"],
        published: publish ?? published,
      };
      if (isEdit && row) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
      setPublished(payload.published);
      toast.success(payload.published ? "Saved & published" : "Draft saved");
      onSaved();
      if (!isEdit) onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>← Back to posts</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => save(false)} disabled={saving}><Save className="mr-2 h-4 w-4" /> Save draft</Button>
          <Button onClick={() => save(true)} disabled={saving}><Eye className="mr-2 h-4 w-4" /> {published ? "Update & keep live" : "Publish"}</Button>
        </div>
      </div>

      {/* Medium-style writer */}
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent font-serif text-4xl leading-tight tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none sm:text-5xl"
        />
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short excerpt / subtitle"
          className="w-full bg-transparent text-lg text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />

        <details className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm">
          <summary className="cursor-pointer text-muted-foreground">Post metadata</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
            <div><Label>Author</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
            <div><Label>Date label</Label><Input value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} /></div>
            <div><Label>Reading time</Label><Input value={readingTime} onChange={(e) => setReadingTime(e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Tags (comma-separated)</Label><Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Hero image URL</Label><Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://…" /></div>
            <div className="sm:col-span-2"><Label>Hero alt</Label><Input value={heroAlt} onChange={(e) => setHeroAlt(e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>AI TL;DR (one bullet per line)</Label><Textarea rows={4} value={tldrStr} onChange={(e) => setTldrStr(e.target.value)} /></div>
          </div>
        </details>

        <div className="pt-2">
          {blocks.map((b, i) => (
            <BlockEditor
              key={i}
              block={b}
              onChange={(patch) => updateBlock(i, patch)}
              onRemove={() => removeBlock(i)}
              onMoveUp={() => moveBlock(i, -1)}
              onMoveDown={() => moveBlock(i, 1)}
              onUpload={(file) => uploadImageFor(i, file)}
            />
          ))}
        </div>

        <BlockToolbar onAdd={addBlock} />
      </div>
    </div>
  );
}

function BlockEditor({
  block, onChange, onRemove, onMoveUp, onMoveDown, onUpload,
}: {
  block: EditorBlock;
  onChange: (patch: Partial<EditorBlock>) => void;
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="group relative -mx-3 rounded-lg px-3 py-2 hover:bg-white/[0.02]">
      <div className="absolute -left-1 top-2 hidden -translate-x-full flex-col gap-1 group-hover:flex">
        <button onClick={onMoveUp} className="rounded p-1 text-muted-foreground hover:text-foreground" title="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
        <button onClick={onMoveDown} className="rounded p-1 text-muted-foreground hover:text-foreground" title="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
        <button onClick={onRemove} className="rounded p-1 text-destructive hover:opacity-80" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>

      {block.type === "p" && (
        <AutoTextarea value={block.text} placeholder="Write your story…" onChange={(v) => onChange({ text: v })} className="w-full bg-transparent text-base leading-relaxed text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none" />
      )}
      {block.type === "h2" && (
        <AutoTextarea value={block.text} placeholder="Heading" onChange={(v) => onChange({ text: v })} className="w-full bg-transparent font-serif text-3xl leading-tight tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
      )}
      {block.type === "h3" && (
        <AutoTextarea value={block.text} placeholder="Subheading" onChange={(v) => onChange({ text: v })} className="w-full bg-transparent text-xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
      )}
      {block.type === "quote" && (
        <AutoTextarea value={block.text} placeholder="Pull quote" onChange={(v) => onChange({ text: v })} className="w-full border-l-2 border-primary bg-transparent pl-6 font-serif text-2xl italic leading-snug text-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
      )}
      {block.type === "ul" && (
        <div className="space-y-1.5">
          {block.items.map((it, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-primary/70" />
              <AutoTextarea
                value={it}
                placeholder="List item"
                onChange={(v) => {
                  const items = [...block.items];
                  items[i] = v;
                  onChange({ items } as Partial<EditorBlock>);
                }}
                className="w-full bg-transparent text-base leading-relaxed text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <button onClick={() => onChange({ items: block.items.filter((_, idx) => idx !== i) } as Partial<EditorBlock>)} className="mt-2 text-xs text-muted-foreground hover:text-destructive">×</button>
            </div>
          ))}
          <button onClick={() => onChange({ items: [...block.items, ""] } as Partial<EditorBlock>)} className="text-xs text-primary">+ add item</button>
        </div>
      )}
      {block.type === "code" && (
        <textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} rows={5} placeholder="Code" className="w-full rounded-lg border border-white/10 bg-[#0f0f14] p-3 font-mono text-sm text-foreground/90 focus:outline-none" />
      )}
      {block.type === "image" && (
        <div className="space-y-2">
          {block.src ? (
            <img src={block.src} alt={block.alt ?? ""} className="w-full rounded-lg border border-white/10" />
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-8 text-sm text-muted-foreground hover:bg-white/[0.04]">
              <ImageIcon className="h-6 w-6" />
              <span>Click to upload image</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
            </label>
          )}
          <Input placeholder="Alt text" value={block.alt ?? ""} onChange={(e) => onChange({ alt: e.target.value } as Partial<EditorBlock>)} />
          <Input placeholder="Caption (optional)" value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value } as Partial<EditorBlock>)} />
          <Input placeholder="Or paste image URL" value={block.src} onChange={(e) => onChange({ src: e.target.value } as Partial<EditorBlock>)} />
        </div>
      )}
    </div>
  );
}

function BlockToolbar({ onAdd }: { onAdd: (t: EditorBlock["type"]) => void }) {
  const btns: { type: EditorBlock["type"]; label: string; icon: React.ReactNode }[] = [
    { type: "p", label: "Text", icon: <Type className="h-4 w-4" /> },
    { type: "h2", label: "H2", icon: <Heading2 className="h-4 w-4" /> },
    { type: "h3", label: "H3", icon: <Heading3 className="h-4 w-4" /> },
    { type: "quote", label: "Quote", icon: <Quote className="h-4 w-4" /> },
    { type: "ul", label: "List", icon: <ListIcon className="h-4 w-4" /> },
    { type: "image", label: "Image", icon: <ImageIcon className="h-4 w-4" /> },
    { type: "code", label: "Code", icon: <CodeIcon className="h-4 w-4" /> },
  ];
  return (
    <div className="sticky bottom-4 mt-6 flex flex-wrap gap-2 rounded-full border border-white/10 bg-background/80 p-2 backdrop-blur-xl">
      {btns.map((b) => (
        <button key={b.type} onClick={() => onAdd(b.type)} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground">
          {b.icon}<span>{b.label}</span>
        </button>
      ))}
    </div>
  );
}

function AutoTextarea({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <textarea
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        onChange(e.target.value);
        e.currentTarget.style.height = "auto";
        e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
      }}
      ref={(el) => {
        if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
      }}
      className={"resize-none " + (className ?? "")}
    />
  );
}

/* ---------------------------- SHARED ------------------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value?: string | null; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={multiline ? "mt-0.5 whitespace-pre-wrap" : "mt-0.5"}>{value}</div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function downloadCSV(filename: string, cols: string[], rows: Record<string, unknown>[]) {
  const esc = (v: unknown) => {
    if (v == null) return "";
    const s = Array.isArray(v) ? v.join("; ") : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function today() { return new Date().toISOString().slice(0, 10); }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
