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
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" />
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
    <header className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-6 pt-6 sm:px-10">
      <a href="/" className="flex items-baseline gap-1 font-display text-2xl italic leading-none tracking-tight">
        <span>Techilla</span>
        <span className="text-muted-foreground/50">Techilla</span>
      </a>
      <nav className="hidden items-center gap-10 section-index sm:flex">
        <a href="#trust" className="transition hover:text-foreground">
          <span className="mr-2 text-foreground/40">01</span>Practice
        </a>
        <a href="#apply" className="transition hover:text-foreground">
          <span className="mr-2 text-foreground/40">02</span>Apply
        </a>
        <a href="#faq" className="transition hover:text-foreground">
          <span className="mr-2 text-foreground/40">03</span>FAQ
        </a>
      </nav>
      <span className="hidden section-index sm:block">Est. Studio</span>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative z-10 mx-auto max-w-[1400px] px-6 pt-24 pb-24 sm:px-10 sm:pt-36 sm:pb-36">
      <div className="mb-16 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">00 / Introduction</span>
        <span className="section-index hidden sm:block">Now accepting Q1 · 2026</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl"
      >
        <h1 className="font-display text-[13vw] leading-[0.92] tracking-[-0.03em] sm:text-[9.5rem]">
          Websites &amp; software
          <br />
          that <span className="italic text-gold">earn</span> their keep.
        </h1>

        <div className="mt-14 grid gap-10 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <p className="text-compressed text-3xl leading-[0.95] text-foreground/90 sm:text-5xl">
              BoutiqueStudioSinceDay1
            </p>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:col-span-6 sm:col-start-7 sm:text-lg">
            Techilla is a boutique studio for founders who need more than a template.
            We build high-conversion websites, custom internal software, and AI automation
            for teams that actually ship. Tell us about your business — we respond within
            twenty-four hours.
          </p>
        </div>

        <div className="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Button
            size="lg"
            onClick={onCta}
            className="group h-14 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90"
          >
            Begin application
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <a
            href="#faq"
            className="section-index transition hover:text-foreground"
          >
            → Read FAQ first
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-28 flex items-center gap-3 text-muted-foreground"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
        <span className="section-index">Scroll</span>
      </motion.div>
    </section>
  );
}

/* ---------------- Trust ---------------- */

function TrustStrip() {
  return (
    <section id="trust" className="relative z-10 mx-auto max-w-[1400px] px-6 pb-32 sm:px-10">
      <div className="mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">01 / Practice</span>
        <span className="section-index hidden sm:block">What every project ships with</span>
      </div>

      <h2 className="mb-16 max-w-4xl font-display text-5xl leading-[0.98] tracking-[-0.02em] sm:text-7xl">
        A small studio,
        <br />
        <span className="italic text-gold">deliberately.</span>
      </h2>

      <div className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
        {TRUST.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="group flex items-start gap-5 p-8 transition hover:bg-white/[0.02] sm:min-h-[180px]"
          >
            <span className="section-index shrink-0 pt-1">
              0{i + 1}
            </span>
            <div className="flex-1">
              <t.icon className="mb-6 h-5 w-5 text-gold" strokeWidth={1.5} />
              <div className="font-display text-2xl leading-tight tracking-tight">
                {t.label}
              </div>
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
    <section id="apply" className="relative z-10 mx-auto max-w-[1400px] px-6 pb-32 sm:px-10">
      <div className="mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">02 / Apply</span>
        <span className="section-index hidden sm:block">Seven steps · ~4 minutes</span>
      </div>
      <h2 className="mb-14 max-w-4xl font-display text-5xl leading-[0.98] tracking-[-0.02em] sm:text-7xl">
        Tell us what you're
        <br />
        <span className="italic text-gold">building.</span>
      </h2>
      <AnimatePresence mode="wait">

        {!active ? (
          <motion.div
            key="teaser"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-border p-10 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Press <kbd className="mx-1 rounded border border-border px-1.5 py-0.5 font-mono text-xs">Begin</kbd> above to open the intake.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl"
          >
            <StickyProgress step={step} progress={progress} />

            <div className="mt-6 border border-border bg-card/40 p-6 sm:p-12">
              <div className="mb-10 flex items-baseline justify-between border-b border-border pb-5">
                <span className="section-index text-gold">
                  Step 0{step + 1} — {STEPS[step].label}
                </span>
                <span className="section-index">Autosaved</span>
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

              <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
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
                  className="group h-12 rounded-full bg-primary px-7 text-primary-foreground hover:bg-primary/90"
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
      <div className="border border-border bg-background/90 px-5 py-3 backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto section-index">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <span
                  className={cn(
                    "whitespace-nowrap transition",
                    i < step && "text-gold",
                    i === step && "text-foreground",
                    i > step && "text-muted-foreground/50",
                  )}
                >
                  0{i + 1} {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="text-muted-foreground/30">·</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px overflow-hidden bg-border">
          <motion.div
            className="h-full bg-gold"
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
    <div className="mb-10">
      <span className="section-index">
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.02em] sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
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
        "group relative flex items-center gap-2 border px-4 py-2 text-sm transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-transparent text-muted-foreground hover:border-foreground/60 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "grid h-3.5 w-3.5 place-items-center border transition",
          active ? "border-background bg-background text-foreground" : "border-border",
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
        "group relative border p-6 text-left transition",
        active
          ? "border-foreground bg-white/[0.04]"
          : "border-border bg-transparent hover:border-foreground/50 hover:bg-white/[0.02]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-xl tracking-tight">{children}</span>
        <span
          className={cn(
            "grid h-5 w-5 place-items-center border transition",
            active ? "border-foreground bg-foreground text-background" : "border-border",

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
    <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-32 pt-8 sm:px-10">
      <div className="mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index text-gold">02 / Received</span>
        <span className="section-index hidden sm:block">Reply within 24 hours</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl"
      >
        <h2 className="font-display text-6xl leading-[0.98] tracking-[-0.02em] sm:text-8xl">
          Application
          <br />
          <span className="italic text-gold">received.</span>
        </h2>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Thanks for the detail. A partner will personally review your intake and reply
          within twenty-four hours. If it's a fit, we'll schedule a discovery call to scope
          the build.
        </p>

        <div className="mt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <a
            href="https://cal.com"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Book discovery call
            <ExternalLink className="h-4 w-4" />
          </a>
          <a href="/" className="section-index transition hover:text-foreground">
            ← Back to home
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function FAQSection() {
  return (
    <section id="faq" className="relative z-10 mx-auto max-w-[1400px] px-6 pb-32 sm:px-10">
      <div className="mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">03 / FAQ</span>
        <span className="section-index hidden sm:block">
          Still curious?{" "}
          <a href="mailto:hello@techilla.studio" className="text-foreground hover:text-gold">
            hello@techilla.studio
          </a>
        </span>
      </div>

      <div className="grid gap-12 sm:grid-cols-12">
        <h2 className="font-display text-5xl leading-[0.98] tracking-[-0.02em] sm:col-span-5 sm:text-7xl">
          Questions
          <br />
          <span className="italic text-gold">worth</span>
          <br />
          answering.
        </h2>

        <Accordion type="single" collapsible className="sm:col-span-7">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b border-border first:border-t"
            >
              <AccordionTrigger className="py-6 text-left font-display text-xl tracking-tight hover:no-underline sm:text-2xl">
                <span className="flex items-baseline gap-4">
                  <span className="section-index shrink-0">0{i + 1}</span>
                  {f.q}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pl-12 text-base leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
        <div className="text-compressed text-[16vw] leading-[0.85] tracking-[-0.04em] sm:text-[13rem]">
          Techilla<span className="text-muted-foreground/40">Techilla</span>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 section-index sm:flex-row sm:items-center">
          <span>Studio · Web · Software · AI</span>
          <a href="mailto:hello@techilla.studio" className="hover:text-foreground">
            hello@techilla.studio
          </a>
          <span>© {new Date().getFullYear()} — All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
