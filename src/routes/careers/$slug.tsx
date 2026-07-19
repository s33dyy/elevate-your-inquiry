import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Briefcase,
  MapPin,
  Clock,
  Share2,
  Bookmark,
  BookmarkCheck,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { getJob, jobs } from "@/lib/jobs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SocialLinks } from "@/components/SocialLinks";

export const Route = createFileRoute("/careers/$slug")({
  loader: ({ params }) => {
    const job = getJob(params.slug);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Position not found | Techilla Careers" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { job } = loaderData;
    return {
      meta: [
        { title: `${job.title} | Techilla Careers` },
        { name: "description", content: job.short },
        { property: "og:title", content: `${job.title} · Techilla` },
        { property: "og:description", content: job.short },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.short,
            employmentType: "CONTRACTOR",
            hiringOrganization: {
              "@type": "Organization",
              name: "Techilla",
              sameAs: "https://techilla.online",
            },
            jobLocationType: "TELECOMMUTE",
            applicantLocationRequirements: { "@type": "Country", name: job.location },
          }),
        },
      ],
    };
  },
  component: JobDetail,
  notFoundComponent: JobNotFound,
  errorComponent: JobError,
});

function JobNotFound() {
  return (
    <div className="min-h-[70dvh] flex items-center justify-center flex-col gap-4 px-6 text-center">
      <h1 className="font-display text-4xl">Position not found</h1>
      <p className="text-muted-foreground">This role may have been filled or removed.</p>
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/careers">Back to careers</Link>
      </Button>
    </div>
  );
}

function JobError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-[70dvh] flex items-center justify-center flex-col gap-4 px-6 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <Button onClick={() => { reset(); router.invalidate(); }} className="rounded-full">
        Try again
      </Button>
    </div>
  );
}

const applicationSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(30),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  linkedin: z.string().trim().max(300).optional().or(z.literal("")),
  portfolio: z.string().trim().max(300).optional().or(z.literal("")),
  education: z.string().trim().max(200).optional().or(z.literal("")),
  experience: z.string().trim().max(120).optional().or(z.literal("")),
  current_occupation: z.string().trim().max(200).optional().or(z.literal("")),
  joining_date: z.string().trim().max(60).optional().or(z.literal("")),
  why_join: z.string().trim().max(2000).optional().or(z.literal("")),
  lead_strategy: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.literal(true, { message: "Please accept the agreement." }),
});

const MAX_FILE = 10 * 1024 * 1024;

function JobDetail() {
  const { job } = Route.useLoaderData() as { job: import("@/lib/jobs").Job };
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    linkedin: "",
    portfolio: "",
    education: "",
    experience: "",
    current_occupation: "",
    joining_date: "",
    why_join: "",
    lead_strategy: "",
    consent: false,
  });
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);

  const savedKey = `techilla_saved_job_${job.slug}`;
  useState(() => {
    if (typeof window !== "undefined") {
      setSaved(!!localStorage.getItem(savedKey));
    }
    return 0;
  });

  function toggleSaved() {
    if (typeof window === "undefined") return;
    if (saved) {
      localStorage.removeItem(savedKey);
      setSaved(false);
      toast("Removed from saved");
    } else {
      localStorage.setItem(savedKey, "1");
      setSaved(true);
      toast.success("Saved for later");
    }
  }

  function shareLink(kind: "linkedin" | "x" | "whatsapp" | "email" | "copy") {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${job.title} at Techilla`;
    const map = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
      copy: "",
    };
    if (kind === "copy") {
      navigator.clipboard?.writeText(url);
      toast.success("Link copied");
      return;
    }
    window.open(map[kind], "_blank", "noopener,noreferrer");
  }

  async function uploadFile(file: File, kind: "resume" | "cover") {
    const ext = file.name.split(".").pop() || "pdf";
    const path = `${job.slug}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("resumes").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    return path;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please review the form.");
      return;
    }
    if (!resume) {
      toast.error("Please upload your resume.");
      return;
    }
    if (resume.size > MAX_FILE || (coverLetter && coverLetter.size > MAX_FILE)) {
      toast.error("Files must be under 10MB.");
      return;
    }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(resume.type)) {
      toast.error("Resume must be a PDF or DOCX.");
      return;
    }

    setSubmitting(true);
    try {
      const resumePath = await uploadFile(resume, "resume");
      const coverPath = coverLetter ? await uploadFile(coverLetter, "cover") : null;

      const { error } = await supabase.from("job_applications").insert({
        job_slug: job.slug,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim() || null,
        linkedin: form.linkedin.trim() || null,
        portfolio: form.portfolio.trim() || null,
        education: form.education.trim() || null,
        experience: form.experience.trim() || null,
        current_occupation: form.current_occupation.trim() || null,
        joining_date: form.joining_date.trim() || null,
        why_join: form.why_join.trim() || null,
        lead_strategy: form.lead_strategy.trim() || null,
        resume_url: resumePath,
        cover_letter_url: coverPath,
      });
      if (error) throw error;
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center px-6">
        <Toaster theme="dark" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="mx-auto h-20 w-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-8"
          >
            <Check className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl">Application Submitted Successfully</h1>
          <p className="mt-4 text-muted-foreground">
            Thank you for your interest in Techilla. We'll review your application and contact
            shortlisted candidates.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link to="/">Return Home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/15">
              <Link to="/careers">Explore Careers</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const otherJobs = jobs.filter((j) => j.slug !== job.slug).slice(0, 3);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Toaster theme="dark" />

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl">Techilla</Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/careers" className="text-foreground">Careers</Link>
          </nav>
          <SocialLinks size={16} />
        </div>
      </header>

      {/* Job hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/15 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-14">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> All positions
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            {job.badge && (
              <span className="text-[10px] uppercase tracking-widest bg-primary/15 text-primary border border-primary/30 rounded-full px-2 py-0.5">
                {job.badge}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{job.department}</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl mt-4 leading-[1.05]">{job.title}</h1>
          <p className="mt-5 text-muted-foreground max-w-2xl">{job.short}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {job.type}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {job.experience}</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Button asChild className="rounded-full">
              <a href="#apply">Apply Now <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button onClick={toggleSaved} variant="outline" className="rounded-full border-white/15">
              {saved ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
              {saved ? "Saved" : "Save"}
            </Button>
            <div className="flex items-center gap-1">
              <button onClick={() => shareLink("linkedin")} className="h-9 w-9 rounded-full border border-white/10 hover:bg-white/5 grid place-items-center text-xs" aria-label="Share on LinkedIn">in</button>
              <button onClick={() => shareLink("x")} className="h-9 w-9 rounded-full border border-white/10 hover:bg-white/5 grid place-items-center text-xs" aria-label="Share on X">X</button>
              <button onClick={() => shareLink("whatsapp")} className="h-9 w-9 rounded-full border border-white/10 hover:bg-white/5 grid place-items-center text-xs" aria-label="Share on WhatsApp">W</button>
              <button onClick={() => shareLink("email")} className="h-9 w-9 rounded-full border border-white/10 hover:bg-white/5 grid place-items-center" aria-label="Share via email"><Share2 className="h-4 w-4" /></button>
              <button onClick={() => shareLink("copy")} className="h-9 w-9 rounded-full border border-white/10 hover:bg-white/5 grid place-items-center" aria-label="Copy link"><LinkIcon className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16 space-y-16">
        <Block title="About Techilla">
          <p className="text-muted-foreground leading-relaxed">{job.about}</p>
        </Block>

        <Block title="Responsibilities">
          <ul className="grid sm:grid-cols-2 gap-3">
            {job.responsibilities.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {r}
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Requirements">
          <ul className="grid sm:grid-cols-2 gap-3">
            {job.requirements.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {r}
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Performance-Based Compensation">
          <div className="rounded-2xl border border-primary/25 bg-primary/[0.04] p-8">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Compensation</div>
            <div className="font-display text-4xl md:text-5xl mt-3">{job.compensation.label}</div>
            {job.compensation.sub && (
              <p className="text-sm text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                {job.compensation.sub}
              </p>
            )}
          </div>
        </Block>

        <Block title="Perks">
          <div className="flex flex-wrap gap-2">
            {job.perks.map((p) => (
              <span key={p} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm">
                {p}
              </span>
            ))}
          </div>
        </Block>

        <Block title="Hiring Process">
          <ol className="space-y-3">
            {job.process.map((step, i) => (
              <li key={step} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
                <span className="h-8 w-8 rounded-full bg-primary/15 border border-primary/30 grid place-items-center text-sm text-primary">
                  {i + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </Block>
      </div>

      {/* Apply */}
      <section id="apply" className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Apply</div>
          <h2 className="font-display text-3xl md:text-5xl mt-2">Apply Now</h2>
          <p className="mt-3 text-muted-foreground">
            Takes 3–5 minutes. Shortlisted candidates will hear back within a week.
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <Grid>
              <Field label="Full Name *">
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={120} />
              </Field>
              <Field label="Email *">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
              </Field>
              <Field label="Phone Number *">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={30} />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={120} />
              </Field>
              <Field label="LinkedIn Profile">
                <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/…" maxLength={300} />
              </Field>
              <Field label="Portfolio / Resume URL">
                <Input value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} placeholder="https://…" maxLength={300} />
              </Field>
              <Field label="Highest Qualification">
                <Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} maxLength={200} />
              </Field>
              <Field label="Years of Experience">
                <Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} maxLength={120} />
              </Field>
              <Field label="Current Occupation">
                <Input value={form.current_occupation} onChange={(e) => setForm({ ...form, current_occupation: e.target.value })} maxLength={200} />
              </Field>
              <Field label="Expected Joining Date">
                <Input value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} placeholder="e.g. Immediate, 2 weeks…" maxLength={60} />
              </Field>
            </Grid>

            <Field label="Why do you want to join Techilla?">
              <Textarea rows={4} value={form.why_join} onChange={(e) => setForm({ ...form, why_join: e.target.value })} maxLength={2000} />
            </Field>
            <Field label="How will you generate leads?">
              <Textarea rows={4} value={form.lead_strategy} onChange={(e) => setForm({ ...form, lead_strategy: e.target.value })} maxLength={2000} />
            </Field>

            <Field label="Upload Resume (PDF/DOCX, max 10MB) *">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary/15 file:text-primary hover:file:bg-primary/25"
                required
              />
            </Field>

            <Field label="Upload Cover Letter (Optional)">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCoverLetter(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-white/10 file:text-foreground hover:file:bg-white/15"
              />
            </Field>

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-1 accent-[color:var(--primary)]"
                required
              />
              <span>
                I agree to the Privacy Policy and understand this is a performance-based
                independent contractor role.
              </span>
            </label>

            <Button type="submit" size="lg" disabled={submitting} className="rounded-full w-full md:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>

      {otherJobs.length > 0 && (
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h3 className="font-display text-2xl md:text-3xl mb-6">Other positions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherJobs.map((o) => (
                <Link
                  key={o.slug}
                  to="/careers/$slug"
                  params={{ slug: o.slug }}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors block"
                >
                  <div className="font-medium">{o.title}</div>
                  <div className="text-xs text-muted-foreground mt-2">{o.type}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-12 flex items-center justify-between flex-wrap gap-6">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Techilla</p>
          <SocialLinks size={16} />
        </div>
      </footer>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
