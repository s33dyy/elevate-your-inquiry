import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Sparkles,
  Shield,
  Clock,
  Zap,
  Server,
  TrendingUp,
  FileCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Toaster, toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: LeadPage,
});

/* ---------------- Constants ---------------- */

const STEPS = [
  { key: "business", label: "Business" },
  { key: "project", label: "Project" },
  { key: "goals", label: "Goals" },
  { key: "problems", label: "Problems" },
  { key: "budget", label: "Budget" },
  { key: "timeline", label: "Timeline" },
  { key: "contact", label: "Contact" },
] as const;

const BUSINESS_SIZES = ["Solo", "2–10", "11–50", "51+"];
const ONLINE_PRESENCE = [
  "Website",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "Google Business",
  "None",
];
const SERVICES = [
  "Website",
  "Landing Page",
  "Website Redesign",
  "Custom Software",
  "CRM",
  "AI Automation",
  "WhatsApp Automation",
  "Lead Management",
  "Dashboard",
  "API Integration",
  "Other",
];
const GOALS = [
  "Generate more leads",
  "Increase sales",
  "Automate operations",
  "Book appointments",
  "Improve branding",
  "Reduce manual work",
  "Launch MVP",
  "Other",
];
const BUDGETS = ["₹5k–10k", "₹10k–25k", "₹25k–50k", "₹50k–1L", "₹1L+", "Not Sure Yet"];
const TIMELINES = ["Immediately", "Within 2 Weeks", "Within 1 Month", "Flexible"];
const CONTACT_METHODS = ["Phone", "WhatsApp", "Email", "Meeting"];

const TRUST = [
  { icon: Zap, label: "5–7 Day Prototype" },
  { icon: TrendingUp, label: "Monthly Updates" },
  { icon: Sparkles, label: "AI Ready" },
  { icon: FileCheck, label: "Built for Growth" },
  { icon: Server, label: "Hosting Included" },
  { icon: Shield, label: "NDA Available" },
];

const FAQS = [
  {
    q: "Do you only build websites?",
    a: "No. Websites are one piece. We build custom software, CRMs, AI automations, dashboards, and integrations — anything that helps a business run itself.",
  },
  {
    q: "How long does a project take?",
    a: "A working prototype in 5–7 days. Full production builds typically ship in 3–8 weeks depending on scope. We share a firm timeline after the discovery call.",
  },
  {
    q: "Can you redesign my existing website?",
    a: "Yes. We audit what's there, keep what converts, and rebuild the rest with a modern stack, faster performance, and clearer conversion paths.",
  },
  {
    q: "Do you offer monthly maintenance?",
    a: "Yes. Every project ships with an optional monthly retainer for updates, monitoring, new features, and hosting — no surprise invoices.",
  },
  {
    q: "Do you build AI automation?",
    a: "It's half of what we do. Lead qualification, WhatsApp bots, internal copilots, document processing, custom dashboards on top of LLMs — production grade, not demos.",
  },
  {
    q: "Can I request custom software?",
    a: "Absolutely. Most of our best work is bespoke: CRMs, admin panels, booking platforms, marketplaces, internal tools. Tell us the problem, we'll design the system.",
  },
];

/* ---------------- Types ---------------- */

type FormState = {
  business_name: string;
  industry: string;
  website: string;
  city: string;
  country: string;
  business_size: string;
  online_presence: string[];
  services_required: string[];
  project_goals: string[];
  current_problems: string;
  budget: string;
  timeline: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  preferred_contact: string;
};

const INITIAL: FormState = {
  business_name: "",
  industry: "",
  website: "",
  city: "",
  country: "",
  business_size: "",
  online_presence: [],
  services_required: [],
  project_goals: [],
  current_problems: "",
  budget: "",
  timeline: "",
  full_name: "",
  email: "",
  phone: "",
  whatsapp: "",
  preferred_contact: "",
};

const STORAGE_KEY = "techilla_lead_draft_v1";

/* ---------------- Validation per step ---------------- */

const stepSchemas = [
  z.object({
    business_name: z.string().trim().min(2, "Business name is required").max(120),
    industry: z.string().trim().min(2, "Industry is required").max(80),
    website: z.string().trim().max(200).optional().or(z.literal("")),
    city: z.string().trim().min(1, "City is required").max(80),
    country: z.string().trim().min(1, "Country is required").max(80),
    business_size: z.string().min(1, "Select a size"),
    online_presence: z.array(z.string()),
  }),
  z.object({ services_required: z.array(z.string()).min(1, "Pick at least one service") }),
  z.object({ project_goals: z.array(z.string()).min(1, "Pick at least one goal") }),
  z.object({
    current_problems: z.string().trim().min(10, "Tell us a bit more").max(2000),
  }),
  z.object({ budget: z.string().min(1, "Select a budget") }),
  z.object({ timeline: z.string().min(1, "Select a timeline") }),
  z.object({
    full_name: z.string().trim().min(2, "Full name is required").max(120),
    email: z.string().trim().email("Enter a valid email").max(160),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
    preferred_contact: z.string().min(1, "Choose one"),
  }),
] as const;

/* ---------------- Page ---------------- */

function LeadPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setShowForm(true);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Toaster theme="dark" position="top-center" richColors />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <Nav />
      <Hero onCta={scrollToForm} />
      <TrustStrip />
      <div ref={formRef}>
        {submitted ? (
          <SuccessScreen />
        ) : (
          <FormSection active={showForm} onSubmitted={() => setSubmitted(true)} />
        )}
      </div>
      <FAQSection />
      <Footer />
    </main>
  );
}

/* ---------------- Nav ---------------- */

function Nav() {
  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 pt-8">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/40">
          <span className="font-display text-lg italic text-primary">T</span>
        </div>
        <span className="text-sm font-medium tracking-tight">Techilla</span>
      </div>
      <div className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
        <a href="#trust" className="transition hover:text-foreground">
          What we do
        </a>
        <a href="#faq" className="transition hover:text-foreground">
          FAQ
        </a>
      </div>
      <span className="hidden text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground sm:block">
        Est. Studio
      </span>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20 sm:pt-32 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary" />
          Now accepting Q1 projects
        </div>

        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-7xl">
          Let's build something{" "}
          <span className="italic text-gold">that grows</span> your business.
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          Whether you need a high-converting website, custom software, or AI automation —
          tell us about your business. We'll review your requirements and respond within
          24 hours.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={onCta}
            className="group h-12 rounded-full bg-primary px-7 text-base font-medium ring-glow hover:bg-primary/90"
          >
            Start your project
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <a
            href="#faq"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Read our FAQ
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-24 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------- Trust ---------------- */

function TrustStrip() {
  return (
    <section id="trust" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          What every project ships with
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TRUST.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="glass group flex flex-col items-start gap-3 rounded-2xl p-4 transition hover:border-primary/40"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition group-hover:bg-primary/20">
              <t.icon className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Check className="h-3.5 w-3.5 text-gold" />
              {t.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Form ---------------- */

function FormSection({
  active,
  onSubmitted,
}: {
  active: boolean;
  onSubmitted: () => void;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) setData({ ...INITIAL, ...parsed.data });
        if (typeof parsed?.step === "number") setStep(Math.min(parsed.step, STEPS.length - 1));
      }
    } catch {}
  }, []);

  // Autosave
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }));
    } catch {}
  }, [data, step]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key as string]: "" }));
  };

  const toggleArr = (key: keyof FormState, value: string) => {
    setData((d) => {
      const arr = d[key] as string[];
      return {
        ...d,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
    setErrors((e) => ({ ...e, [key as string]: "" }));
  };

  const validateStep = () => {
    const schema = stepSchemas[step];
    const result = schema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        errs[path] = issue.message;
      }
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step === STEPS.length - 1) {
      void submit();
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        website: data.website || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
      };
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Application submitted");
      onSubmitted();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="teaser"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border border-border bg-card/40 p-10 text-center backdrop-blur"
          >
            <p className="text-sm text-muted-foreground">
              Scroll or press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs">Start</kbd> above to begin your application.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StickyProgress step={step} progress={progress} />

            <div className="glass mt-6 rounded-3xl p-6 sm:p-10">
              <div className="mb-8 flex items-baseline justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold">
                  Step {step + 1} / {STEPS.length}
                </span>
                <span className="text-xs text-muted-foreground">Autosaved</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step === 0 && <StepBusiness data={data} update={update} toggleArr={toggleArr} errors={errors} />}
                  {step === 1 && <StepProject data={data} update={update} toggleArr={toggleArr} errors={errors} />}
                  {step === 2 && <StepGoals data={data} update={update} toggleArr={toggleArr} errors={errors} />}
                  {step === 3 && <StepProblems data={data} update={update} toggleArr={toggleArr} errors={errors} />}
                  {step === 4 && <StepBudget data={data} update={update} toggleArr={toggleArr} errors={errors} />}
                  {step === 5 && <StepTimeline data={data} update={update} toggleArr={toggleArr} errors={errors} />}
                  {step === 6 && <StepContact data={data} update={update} toggleArr={toggleArr} errors={errors} />}
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={back}
                  disabled={step === 0 || submitting}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={next}
                  disabled={submitting}
                  className="group h-11 rounded-full bg-primary px-6 hover:bg-primary/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                    </>
                  ) : step === STEPS.length - 1 ? (
                    <>Submit application</>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------------- Progress ---------------- */

function StickyProgress({ step, progress }: { step: number; progress: number }) {
  return (
    <div className="sticky top-4 z-30">
      <div className="glass rounded-2xl px-4 py-3">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "whitespace-nowrap rounded-full px-2.5 py-1 font-mono uppercase tracking-wider transition",
                    i < step && "text-gold",
                    i === step && "bg-primary/15 text-primary ring-1 ring-primary/30",
                    i > step && "text-muted-foreground/60",
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="text-muted-foreground/40">/</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="h-0.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-[color:var(--gold)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared field bits ---------------- */

function Field({
  label,
  hint,
  error,
  children,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-sm font-medium text-foreground">
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
          )}
        </Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StepHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function ChipToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-primary/50 bg-primary/15 text-foreground"
          : "border-border bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "grid h-4 w-4 place-items-center rounded-full border transition",
          active ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {active && <Check className="h-2.5 w-2.5" />}
      </span>
      {children}
    </button>
  );
}

function CardSelect({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative rounded-2xl border p-5 text-left transition",
        active
          ? "border-primary/60 bg-primary/10 ring-glow"
          : "border-border bg-card/40 hover:border-primary/30 hover:bg-card/70",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{children}</span>
        <span
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full border transition",
            active ? "border-primary bg-primary text-primary-foreground" : "border-border",
          )}
        >
          {active && <Check className="h-3 w-3" />}
        </span>
      </div>
    </button>
  );
}

/* ---------------- Steps ---------------- */

type StepProps = {
  data: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleArr: (key: keyof FormState, value: string) => void;
  errors: Record<string, string>;
};

function StepBusiness({ data, update, toggleArr, errors }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 01"
        title="Tell us about your business."
        subtitle="A few basics so we can put your project in context."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business name" error={errors.business_name}>
          <Input
            value={data.business_name}
            onChange={(e) => update("business_name", e.target.value)}
            placeholder="Acme Studio"
          />
        </Field>
        <Field label="Industry" error={errors.industry}>
          <Input
            value={data.industry}
            onChange={(e) => update("industry", e.target.value)}
            placeholder="e.g. Real estate, D2C, SaaS"
          />
        </Field>
        <Field label="Website" optional error={errors.website}>
          <Input
            value={data.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="Business size" error={errors.business_size}>
          <Select value={data.business_size} onValueChange={(v) => update("business_size", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Team size" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="City" error={errors.city}>
          <Input
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Bengaluru"
          />
        </Field>
        <Field label="Country" error={errors.country}>
          <Input
            value={data.country}
            onChange={(e) => update("country", e.target.value)}
            placeholder="India"
          />
        </Field>
      </div>
      <div className="mt-8">
        <Label className="text-sm font-medium">Current online presence</Label>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">Select all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {ONLINE_PRESENCE.map((p) => (
            <ChipToggle
              key={p}
              active={data.online_presence.includes(p)}
              onClick={() => toggleArr("online_presence", p)}
            >
              {p}
            </ChipToggle>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepProject({ data, toggleArr, errors }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 02"
        title="What do you need?"
        subtitle="Pick everything relevant — we scope tightly after the discovery call."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <CardSelect
            key={s}
            active={data.services_required.includes(s)}
            onClick={() => toggleArr("services_required", s)}
          >
            {s}
          </CardSelect>
        ))}
      </div>
      {errors.services_required && (
        <p className="mt-3 text-xs text-destructive">{errors.services_required}</p>
      )}
    </div>
  );
}

function StepGoals({ data, toggleArr, errors }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 03"
        title="What are your goals?"
        subtitle="Outcomes you want to hit in the next 6 months."
      />
      <div className="flex flex-wrap gap-2">
        {GOALS.map((g) => (
          <ChipToggle
            key={g}
            active={data.project_goals.includes(g)}
            onClick={() => toggleArr("project_goals", g)}
          >
            {g}
          </ChipToggle>
        ))}
      </div>
      {errors.project_goals && (
        <p className="mt-3 text-xs text-destructive">{errors.project_goals}</p>
      )}
    </div>
  );
}

function StepProblems({ data, update, errors }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 04"
        title="What's slowing you down?"
        subtitle="Be specific. The clearer the problem, the sharper our first proposal."
      />
      <Textarea
        value={data.current_problems}
        onChange={(e) => update("current_problems", e.target.value)}
        rows={8}
        placeholder={`Describe what's slowing your business down.

Examples:
• Losing leads through WhatsApp with no follow-up
• Slow website — bounce rate 70%+
• No online presence at all
• Manual data entry between tools
• Poor conversion on our landing page`}
        className="min-h-[200px] resize-none rounded-2xl bg-card/50 p-5 leading-relaxed"
      />
      {errors.current_problems && (
        <p className="mt-2 text-xs text-destructive">{errors.current_problems}</p>
      )}
    </div>
  );
}

function StepBudget({ data, update, errors }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 05"
        title="What's your budget?"
        subtitle="We work best when scope and budget are honestly matched."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUDGETS.map((b) => (
          <CardSelect
            key={b}
            active={data.budget === b}
            onClick={() => update("budget", b)}
          >
            {b}
          </CardSelect>
        ))}
      </div>
      {errors.budget && <p className="mt-3 text-xs text-destructive">{errors.budget}</p>}
    </div>
  );
}

function StepTimeline({ data, update, errors }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 06"
        title="When do you want to start?"
        subtitle="Rough is fine. We block calendar slots per week."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {TIMELINES.map((t) => (
          <CardSelect
            key={t}
            active={data.timeline === t}
            onClick={() => update("timeline", t)}
          >
            {t}
          </CardSelect>
        ))}
      </div>
      {errors.timeline && <p className="mt-3 text-xs text-destructive">{errors.timeline}</p>}
    </div>
  );
}

function StepContact({ data, update, errors }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 07"
        title="How can we reach you?"
        subtitle="We'll get back within 24 hours."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.full_name}>
          <Input
            value={data.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            placeholder="Priya Sharma"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@company.com"
          />
        </Field>
        <Field label="Phone" optional error={errors.phone}>
          <Input
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+91"
          />
        </Field>
        <Field label="WhatsApp" optional error={errors.whatsapp}>
          <Input
            value={data.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="+91"
          />
        </Field>
      </div>
      <div className="mt-8">
        <Label className="text-sm font-medium">Preferred contact method</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONTACT_METHODS.map((m) => (
            <ChipToggle
              key={m}
              active={data.preferred_contact === m}
              onClick={() => update("preferred_contact", m)}
            >
              {m}
            </ChipToggle>
          ))}
        </div>
        {errors.preferred_contact && (
          <p className="mt-2 text-xs text-destructive">{errors.preferred_contact}</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Success ---------------- */

function SuccessScreen() {
  return (
    <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass overflow-hidden rounded-3xl p-10 text-center sm:p-16"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
          className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full bg-primary/15 ring-1 ring-primary/40"
        >
          <Check className="h-9 w-9 text-primary" strokeWidth={2.5} />
        </motion.div>

        <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Application <span className="italic text-gold">submitted.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-balance text-muted-foreground">
          Thanks for telling us about your project. We'll review your requirements and get
          back to you within 24 hours. If it's a good fit, we'll schedule a free discovery
          call.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/">
            <Button variant="outline" className="h-11 rounded-full px-6">
              Back home
            </Button>
          </a>
          <a
            href="https://cal.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground ring-glow transition hover:bg-primary/90"
          >
            Book discovery call
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function FAQSection() {
  return (
    <section id="faq" className="relative z-10 mx-auto max-w-3xl px-6 pb-32">
      <div className="mb-10 flex items-baseline justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          FAQ
        </span>
        <span className="text-xs text-muted-foreground">
          Still curious?{" "}
          <a href="#" className="text-foreground underline-offset-4 hover:underline">
            hello@techilla.studio
          </a>
        </span>
      </div>
      <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
        Questions <span className="italic text-gold">worth</span> answering.
      </h2>
      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {FAQS.map((f, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="glass rounded-2xl border-none px-5"
          >
            <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/30">
            <span className="font-display text-base italic text-primary">T</span>
          </div>
          <span>Techilla — Studio for web, software & AI</span>
        </div>
        <span className="text-xs font-mono uppercase tracking-[0.2em]">
          © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
