import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { z } from "zod";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Sparkles,
  Shield,
  Zap,
  Server,
  TrendingUp,
  FileCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";
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

const HeroSculpture3D = lazy(() => import("@/components/HeroSculpture3D"));
const PerspectiveGrid = lazy(() => import("@/components/PerspectiveGrid"));
const SectionOrb = lazy(() => import("@/components/SectionOrb"));
const Preloader = lazy(() => import("@/components/Preloader"));
import { Magnetic } from "@/components/cursor/Magnetic";


function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function useWebGLStatus() {
  const [status, setStatus] = useState<"checking" | "enabled" | "disabled">("checking");
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isDesktop || reduced) {
      setStatus("disabled");
      return;
    }
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      setStatus(gl ? "enabled" : "disabled");
    } catch {
      setStatus("disabled");
    }
  }, []);
  return status;
}


/* ============================================================ */
/*  Design tokens (inline helpers)                               */
/* ============================================================ */

const G = {
  purple:
    "linear-gradient(135deg, #8B7DFF 0%, #B4A9FF 52%, #6E78FF 100%)" as const,
  purpleSubtle:
    "linear-gradient(135deg, #8B7DFF 0%, #7A6FEE 100%)" as const,
  primaryBtn: {
    background: "linear-gradient(135deg, #8B7DFF 0%, #7A6FEE 100%)",
    border: "1px solid rgba(139,125,255,0.35)",
    boxShadow:
      "0 0 20px rgba(139,125,255,0.18), 0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  primaryBtnHover: {
    boxShadow:
      "0 0 40px rgba(139,125,255,0.30), 0 8px 28px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
} as const;

function purpleText(italic = true): React.CSSProperties {
  return {
    background: G.purple,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontStyle: italic ? "italic" : "normal",
  };
}

/* ============================================================ */
/*  Constants                                                    */
/* ============================================================ */

const STEPS = [
  { key: "business", label: "Business" },
  { key: "project", label: "Project" },
  { key: "goals", label: "Goals" },
  { key: "problems", label: "Problems" },
  { key: "budget", label: "Budget" },
  { key: "timeline", label: "Timeline" },
  { key: "contact", label: "Contact" },
] as const;
/* ============================================================ */
/*  GlowingText                                                  */
/* ============================================================ */
function GlowingText({ children, className = "" }: { children: string; className?: string }) {
  const words = children.split(" ");
  return (
    <p className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ color: "rgba(255, 255, 255, 0.55)", textShadow: "none" }}
          whileInView={{ 
            color: "#ffffff",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(139, 125, 255, 0.4)"
          }}
          transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
          viewport={{ once: false, margin: "-100px" }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </p>
  );
}

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
  "Workflow Automation",
  "Lead & Sales Automation",
  "Customer Communication",
  "Systems Integration",
  "AI Automation",
  "Internal Tools & Dashboards",
  "CRM Automation",
  "WhatsApp Automation",
  "Document Processing",
  "Reporting Automation",
  "Custom Process Automation",
  "Other",
];
const GOALS = [
  "Reduce manual work",
  "Automate lead follow-up",
  "Connect disconnected tools",
  "Faster customer response",
  "Automate reporting",
  "Streamline operations",
  "Build a custom internal tool",
  "Other",
];
const BUDGETS = [
  "₹5k–10k",
  "₹10k–25k",
  "₹25k–50k",
  "₹50k–1L",
  "₹1L+",
  "Not Sure Yet",
];
const TIMELINES = [
  "Immediately",
  "Within 2 Weeks",
  "Within 1 Month",
  "Flexible",
];
const CONTACT_METHODS = ["Phone", "WhatsApp", "Meeting"];

const TRUST = [
  { icon: Zap, label: "Process-First Approach" },
  { icon: TrendingUp, label: "Measurable Outcomes" },
  { icon: Sparkles, label: "AI Where It Matters" },
  { icon: FileCheck, label: "Built for Your Workflow" },
  { icon: Server, label: "Integrations Included" },
  { icon: Shield, label: "NDA Available" },
];

const FAQS = [
  {
    q: "What exactly does Techilla do?",
    a: "We identify inefficient, repetitive, or disconnected processes inside your business and implement technology to fix them — automation, AI, integrations, internal tools, or custom software depending on what the problem needs.",
  },
  {
    q: "How is this different from an agency?",
    a: "We don't start with 'you need a website' or 'you need AI'. We start with your process. Technology is the tool, not the product. If your problem is best solved by connecting two tools you already use, that's what we build.",
  },
  {
    q: "How much does an automation project cost?",
    a: "Solutions start from $299. Every business process is different, so we scope each solution based on complexity, integrations, and implementation. You get a custom quote after a short discovery conversation.",
  },
  {
    q: "How long does a typical project take?",
    a: "A focused workflow automation often ships in 1–3 weeks. Multi-step systems and integrations take 3–8 weeks. We share a firm timeline after we understand your current process.",
  },
  {
    q: "Do you work with small businesses?",
    a: "Yes — small and mid-sized businesses are our focus. Clinics, agencies, real estate, education, hospitality, professional services. If your team spends hours on repetitive work, there's usually something to automate.",
  },
  {
    q: "Do you use AI in every project?",
    a: "Only when it genuinely helps. AI is powerful for classification, extraction, routing, and intelligent workflows — but many operational problems are solved better and cheaper with plain automation and integrations.",
  },
];

/* ============================================================ */
/*  Types                                                        */
/* ============================================================ */

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

  phone: "",
  whatsapp: "",
  preferred_contact: "",
};

const STORAGE_KEY = "techilla_lead_draft_v1";

/* ============================================================ */
/*  Validation                                                   */
/* ============================================================ */

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
  z.object({
    services_required: z.array(z.string()).min(1, "Pick at least one service"),
  }),
  z.object({
    project_goals: z.array(z.string()).min(1, "Pick at least one goal"),
  }),
  z.object({
    current_problems: z.string().trim().min(10, "Tell us a bit more").max(2000),
  }),
  z.object({ budget: z.string().min(1, "Select a budget") }),
  z.object({ timeline: z.string().min(1, "Select a timeline") }),
  z.object({
    full_name: z.string().trim().min(2, "Full name is required").max(120),

    phone: z.string().trim().max(40).optional().or(z.literal("")),
    whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
    preferred_contact: z.string().min(1, "Choose one"),
  }),
] as const;

/* ============================================================ */
/*  Framer variants                                              */
/* ============================================================ */

const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* Old CSS-based visual elements removed for WebGL transition */

/* ============================================================ */
/*  Nav                                                          */
/* ============================================================ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const NAV_LINKS = [
    ["#trust", "01", "Practice"],
    ["#apply", "02", "Apply"],
    ["#faq", "03", "FAQ"],
    ["/blog", "04", "Blog"],
    ["/careers", "05", "Careers"],
  ] as const;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled ? "glass-nav" : "",
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-10">
          <a
            href="/"
            className="flex items-center gap-2.5 font-display text-xl italic leading-none tracking-tight"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: G.purple,
                boxShadow: "0 0 10px rgba(139,125,255,0.6)",
              }}
            />
            Techilla
          </a>

          <nav className="hidden items-center gap-8 sm:flex">
            {NAV_LINKS.map(([href, num, label]) => (
              <a
                key={href}
                href={href}
                className="section-index group flex items-center gap-2 transition-colors duration-200 hover:text-white"
              >
                <span
                  className="transition-colors duration-200"
                  style={{ color: "rgba(139,125,255,0.4)" }}
                >
                  {num}
                </span>
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-5 sm:flex">
            <SocialLinks size={16} />
            <Magnetic cursor="button">
              <motion.a
                href="#apply"
                whileHover={{
                  y: -1,
                  boxShadow: "0 0 18px rgba(139,125,255,0.25)",
                }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white"
                style={{
                  background: "rgba(139,125,255,0.10)",
                  border: "1px solid rgba(139,125,255,0.25)",
                  boxShadow: "0 0 10px rgba(139,125,255,0.08)",
                }}
              >
                Apply now
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.a>
            </Magnetic>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{
              background: "rgba(139,125,255,0.10)",
              border: "1px solid rgba(139,125,255,0.28)",
            }}
          >
            <span className="sr-only">Menu</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-xl sm:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display text-xl italic tracking-tight text-foreground">
                Techilla
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{
                  background: "rgba(139,125,255,0.10)",
                  border: "1px solid rgba(139,125,255,0.28)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-6 px-8">
              {NAV_LINKS.map(([href, num, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-baseline gap-4"
                >
                  <span
                    className="text-xs"
                    style={{ color: "rgba(139,125,255,0.7)" }}
                  >
                    {num}
                  </span>
                  <span className="font-display text-4xl tracking-tight text-foreground">
                    {label}
                  </span>
                </a>
              ))}
              <a
                href="#apply"
                onClick={() => setMenuOpen(false)}
                className="mt-4 inline-flex items-center gap-2 self-start rounded-full px-6 py-3 text-base font-medium text-white"
                style={{
                  background: "rgba(139,125,255,0.15)",
                  border: "1px solid rgba(139,125,255,0.35)",
                }}
              >
                Apply now
                <ArrowRight className="h-4 w-4" />
              </a>
            </nav>

            <div className="border-t border-border px-8 py-6">
              <div className="flex items-center justify-between">
                <span className="section-index">Follow</span>
                <SocialLinks size={22} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================ */
/*  Hero                                                         */
/* ============================================================ */



function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="pointer-events-none relative z-10 mx-auto max-w-[1400px] px-6 pb-12 pt-20 sm:px-10 sm:pt-28 sm:pb-16">
      {/* Section label row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="pointer-events-auto mb-16 flex items-baseline justify-between border-t border-border pt-6"
      >
        <span className="section-index">00 / Business Process Automation</span>
        <span className="section-index hidden sm:block">
          Solutions starting from $299
        </span>
      </motion.div>

      {/* Content grid */}
      <div className="grid items-center gap-12 lg:grid-cols-1">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="relative">
            <h1 className="font-display leading-[0.92] tracking-[-0.03em] text-[clamp(2.6rem,10vw,8rem)]">
              Automate the work
              <br />
              that <span style={purpleText(true)}>slows</span> your business down.
            </h1>
          </div>

          {/* Sub-copy grid */}
          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <p className="text-compressed text-xl leading-[0.93] text-white/75 sm:text-4xl">
                ProcessFirst
                <br />
                TechnologySecond
              </p>
            </div>
            <GlowingText className="max-w-xl text-sm leading-relaxed sm:col-span-6 sm:col-start-7 sm:text-lg">
              Techilla identifies inefficient processes, repetitive tasks, and disconnected
              workflows in your business — then builds the technology that fixes them.
              Automation, AI, integrations, and custom internal tools. Solutions starting from $299.
            </GlowingText>
          </div>

          {/* CTA row */}
          <div className="pointer-events-auto mt-14 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Magnetic cursor="button">
              <motion.button
                onClick={onCta}
                whileHover={{
                  y: -2,
                  ...G.primaryBtnHover,
                }}
                whileTap={{ y: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-base font-medium text-white"
                style={G.primaryBtn}
              >
                Find what you can automate
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Magnetic>

            <a
              href="#faq"
              className="section-index transition-colors duration-200 hover:text-white"
            >
              → Book an automation call
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="mt-24 flex items-center gap-3 text-white/70"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
        <span className="section-index">Scroll to explore</span>
      </motion.div>
    </section>
  );
}

/* ============================================================ */
/*  Trust Strip                                                  */
/* ============================================================ */

function TrustStrip() {
  return (
    <section
      id="trust"
      className="pointer-events-none relative z-10 mx-auto max-w-[1400px] px-6 pb-20 sm:px-10"
    >
      <div className="pointer-events-auto mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">01 / How We Work</span>
        <span className="section-index hidden sm:block">
          Process first. Technology second.
        </span>
      </div>

      <h2 className="mb-16 max-w-4xl font-display text-5xl leading-[0.97] tracking-[-0.025em] sm:text-7xl">
        We don't start with technology.
        <br />
        We start with the <span style={purpleText(true)}>problem.</span>
      </h2>

      {/* Glass cards grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {TRUST.map((t, i) => (
          <Magnetic key={t.label} cursor="card" action="parallax">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="glass-card cursor-spotlight group flex h-full flex-col justify-between rounded-xl p-3 transition-colors duration-300 hover:border-[rgba(139,125,255,0.14)] sm:rounded-2xl sm:p-8"
            >
            <div className="mb-3 flex flex-col-reverse justify-between gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-0">
              <span
                className="section-index text-[10px] sm:text-xs"
                style={{ color: "rgba(139,125,255,0.45)" }}
              >
                0{i + 1}
              </span>
              <t.icon
                className="h-4 w-4 self-end transition-all duration-300 sm:h-5 sm:w-5 sm:self-auto"
                strokeWidth={1.5}
                style={{ color: "rgba(139,125,255,0.55)" }}
              />
            </div>
            <div className="font-display text-xs leading-[1.15] tracking-tight sm:text-2xl sm:leading-tight">
              {t.label}
            </div>
            {/* Purple left accent — appears on hover */}
            <div
              className="mt-5 h-px w-0 transition-all duration-500 group-hover:w-full"
              style={{
                background: G.purple,
                opacity: 0.35,
              }}
            />
          </motion.div>
          </Magnetic>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/*  Lead Page (root)                                             */
/* ============================================================ */

function LeadPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handlePreloaderDone = useCallback(() => setLoading(false), []);

  const scrollToForm = () => {
    setShowForm(true);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const webglStatus = useWebGLStatus();
  const reduced = useReducedMotion();

  // If WebGL is unavailable, don't wait for a 3D scene that will not render.
  // While WebGL is still being detected, keep the preloader active.
  useEffect(() => {
    if (webglStatus === "disabled") setSceneReady(true);
  }, [webglStatus]);

  return (
    <>
      <Suspense fallback={null}>
        {loading && (
          <Preloader ready={sceneReady} onDone={handlePreloaderDone} />
        )}
      </Suspense>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-[100dvh] overflow-hidden"
        style={{
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <Toaster theme="dark" position="top-center" richColors />
        
        {/* Scene 1: The Cinematic Background */}
        <Suspense fallback={null}>
          <HeroSculpture3D onReady={handleSceneReady} />
        </Suspense>


        <Nav />
        <Hero onCta={scrollToForm} />

        <TrustStrip />
        <PortfolioSection />
        <PricingSection onCta={scrollToForm} />

        {/* Old SectionOrb removed for WebGL transition */}

        <div ref={formRef} className="pointer-events-auto mt-12">
          {submitted ? (
            <SuccessScreen />
          ) : (
            <FormSection
              active={showForm}
              onSubmitted={() => setSubmitted(true)}
              onActivate={scrollToForm}
            />
          )}
        </div>

        {/* Old SectionOrb removed for WebGL transition */}

        <FAQSection />
        <Footer />
      </motion.main>
    </>
  );
}

/* ============================================================ */
/*  Portfolio Section                                            */
/* ============================================================ */

const projects = [
  {
    title: "Sports Storytelling Studio",
    tags: "WebGL · Headless CMS",
    description: "WebGL-enhanced homepage with scroll-tied 3D motion and interactive campaign story modules. Internal teams now launch campaign pages in hours.",
    link: "podium.global ↗",
    url: "https://podium.global"
  },
  {
    title: "Energy Drink Brand Launch",
    tags: "Three.js · Mobile-first",
    description: "Bold mobile-first landing with animated 3D can renders, a flavor carousel, and analytics events for conversion tracking on low-end devices.",
    link: "ciaoenergy.com ↗",
    url: "https://ciaoenergy.com"
  },
  {
    title: "Pahari Art Exhibition",
    tags: "Next.js · GSAP · Zustand",
    description: "Scroll-based narrative, navigable 3D gallery, and contextual tooltips celebrating Pahari miniature art. Visitors average several minutes exploring each scene.",
    link: "pahari.vercel.app ↗",
    url: "https://pahari.vercel.app"
  },
  {
    title: "Crypto Investment Fund",
    tags: "MDX · Faceted Search",
    description: "MDX-driven research portal with faceted portfolio search by sector, stage, and geography, plus AI-powered TL;DR summaries for deep-research posts.",
    link: "dragonfly.xyz ↗",
    url: "https://dragonfly.xyz"
  }
];

function PortfolioSection() {
  return (
    <section
      id="portfolio"
      className="pointer-events-none relative z-10 mx-auto max-w-[1400px] px-6 pb-20 sm:px-10"
    >
      <div className="pointer-events-auto mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">02 / Work</span>
        <span className="section-index hidden sm:block">
          Selected Projects
        </span>
      </div>

      <div className="pointer-events-auto">
        <h2 className="mb-6 max-w-4xl font-display text-5xl leading-[0.97] tracking-[-0.025em] sm:text-7xl">
          Selected Projects
        </h2>
        <GlowingText className="mb-16 max-w-2xl text-lg leading-relaxed">
          A cross-section of automation, integration, and interface work we've shipped for operations-heavy teams.
        </GlowingText>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {projects.map((project, i) => (
            <Magnetic key={i} cursor="card" action="parallax">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1 }}
                className="group flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-white/10 hover:bg-white/10 sm:p-10 cursor-spotlight"
              >
              <div>
                <div className="mb-3 text-[10px] sm:mb-4 sm:text-xs font-mono tracking-wider text-white/70 uppercase">
                  {project.tags}
                </div>
                <h3 className="mb-2 font-display text-lg leading-tight sm:mb-6 sm:text-3xl text-white group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="hidden text-sm leading-relaxed text-white/70/90 sm:block">
                  {project.description}
                </p>
              </div>
              <div className="mt-auto pt-3 border-t border-white/10 sm:mt-10 sm:pt-6">
                <a 
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium tracking-wide text-white/80 transition-colors hover:text-primary group-hover:text-white"
                >
                  {project.link}
                </a>
              </div>
              </motion.div>
            </Magnetic>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  Pricing Section                                              */
/* ============================================================ */

function PricingSection({ onCta }: { onCta: () => void }) {
  const tiers = [
    {
      name: "Automation Starter",
      price: "From $299",
      sub: "One focused workflow",
      desc: "For automating a single repetitive process — lead capture, follow-up sequences, form-to-CRM, or a specific manual task consuming your team's time.",
      features: [
        "Scoped to one workflow",
        "Tool integrations included",
        "Runbook & documentation",
        "2 weeks of iteration",
      ],
      cta: "Start with a workflow",
      highlight: false,
    },
    {
      name: "Custom Automation",
      price: "Custom Quote",
      sub: "Multi-step systems",
      desc: "For multi-step workflows, business-specific systems, and connecting several tools. AI where it genuinely helps, integrations, and internal dashboards.",
      features: [
        "Discovery & process mapping",
        "Multi-tool integrations",
        "AI / custom logic where useful",
        "Testing against real workflows",
      ],
      cta: "Get a custom quote",
      highlight: true,
    },
    {
      name: "Automation Partnership",
      price: "Custom Quote",
      sub: "Ongoing development",
      desc: "For businesses that want a team continuously improving their operations — new automations, optimizations, and maintenance as the business evolves.",
      features: [
        "Monthly automation roadmap",
        "Ongoing development",
        "Priority support",
        "Optimization & monitoring",
      ],
      cta: "Talk about partnering",
      highlight: false,
    },
  ];
  return (
    <section
      id="pricing"
      className="pointer-events-none relative z-10 mx-auto max-w-[1400px] px-6 pb-20 sm:px-10"
    >
      <div className="pointer-events-auto mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">03 / Pricing</span>
        <span className="section-index hidden sm:block">
          Every process is different
        </span>
      </div>

      <div className="pointer-events-auto">
        <h2 className="mb-6 max-w-4xl font-display text-5xl leading-[0.97] tracking-[-0.025em] sm:text-7xl">
          Automation, priced to your <span style={purpleText(true)}>process.</span>
        </h2>
        <GlowingText className="mb-16 max-w-2xl text-lg leading-relaxed">
          Solutions start from $299. Every business process is different — we scope each engagement based on complexity, integrations, and implementation requirements.
        </GlowingText>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-3">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 backdrop-blur-md transition-colors",
                t.highlight
                  ? "border border-primary/40 bg-primary/5"
                  : "border border-[rgba(139,125,255,0.15)] bg-card/10 hover:border-[rgba(139,125,255,0.3)]",
              )}
              style={t.highlight ? { boxShadow: "0 0 40px rgba(139,125,255,0.05)" } : undefined}
            >
              {t.highlight && (
                <div className="absolute -top-3 right-8 rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-wider text-white">
                  MOST COMMON
                </div>
              )}
              <div>
                <h3 className="font-display text-2xl sm:text-3xl">{t.name}</h3>
                <p className="mt-2 text-xs uppercase tracking-widest text-white/60 font-mono">{t.sub}</p>

                <div className="my-6 border-y border-white/10 py-6">
                  <div className="font-display text-3xl sm:text-5xl" style={purpleText(false)}>
                    {t.price}
                  </div>
                </div>

                <p className="mb-6 text-sm text-white/70 leading-relaxed">{t.desc}</p>

                <ul className="mb-8 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-white/75">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                onClick={onCta}
                whileHover={{ y: -2, ...G.primaryBtnHover }}
                whileTap={{ y: 0, scale: 0.98 }}
                className="w-full rounded-xl py-3 text-sm font-medium text-white transition-all"
                style={
                  t.highlight
                    ? G.primaryBtn
                    : {
                        background: "rgba(139,125,255,0.12)",
                        border: "1px solid rgba(139,125,255,0.25)",
                      }
                }
              >
                {t.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-white/70">
            Every project starts with a free automation opportunity audit — we review your process before quoting anything.
          </p>
          <p className="text-xs text-white/60 section-index">
            NDA available on request · Solutions start from $299
          </p>
        </div>
      </div>
    </section>
  );
}



/* ============================================================ */
/*  Form Section                                                  */
/* ============================================================ */

function FormSection({
  active,
  onSubmitted,
  onActivate,
}: {
  active: boolean;
  onSubmitted: () => void;
  onActivate: () => void;
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
        if (typeof parsed?.step === "number")
          setStep(Math.min(parsed.step, STEPS.length - 1));
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
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
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
        email: "not-provided@example.com",
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
    <section
      id="apply"
      className="pointer-events-none relative z-10 mx-auto max-w-[1400px] px-6 pb-36 sm:px-10"
    >
      <div className="pointer-events-auto mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">04 / Apply</span>
        <span className="section-index hidden sm:block">
          Seven steps · ~4 minutes
        </span>
      </div>

      <h2 className="mb-14 max-w-4xl font-display text-5xl leading-[0.97] tracking-[-0.025em] sm:text-7xl">
        Tell us what you're
        <br />
        <span style={purpleText(true)}>building.</span>
      </h2>

      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="teaser"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto glass-card cursor-spotlight rounded-2xl px-6 py-14 sm:px-16 sm:py-20"
          >
            <div className="mx-auto flex max-w-lg flex-col items-center gap-7 text-center">
              {/* Decorative rule */}
              <div
                className="h-px w-12 rounded-full"
                style={{ background: G.purple, opacity: 0.5 }}
              />
              <GlowingText className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/70">
                We don't build websites. We build digital products that generate leads, automate operations, and help your business grow.
              </GlowingText>
              <Magnetic cursor="button">
                <motion.button
                  onClick={onActivate}
                  whileHover={{ y: -2, ...G.primaryBtnHover }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-base font-medium text-white"
                  style={G.primaryBtn}
                >
                  Begin application
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Magnetic>
              <span className="section-index">Seven steps · ~4 minutes · Autosaved</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mx-auto max-w-4xl"
          >
            <StickyProgress step={step} progress={progress} />

            <div className="mt-2 rounded-2xl p-0 sm:mt-5 sm:glass-card sm:p-12">
              {/* Step label (hidden on mobile to save space, already in sticky header) */}
              <div className="mb-10 hidden items-baseline justify-between border-b border-border pb-5 sm:flex">
                <span
                  className="section-index"
                  style={{ color: "rgba(139,125,255,0.7)" }}
                >
                  Step 0{step + 1} — {STEPS[step].label}
                </span>
                <span className="section-index">Autosaved</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step === 0 && (
                    <StepBusiness
                      data={data}
                      update={update}
                      toggleArr={toggleArr}
                      errors={errors}
                    />
                  )}
                  {step === 1 && (
                    <StepProject
                      data={data}
                      update={update}
                      toggleArr={toggleArr}
                      errors={errors}
                    />
                  )}
                  {step === 2 && (
                    <StepGoals
                      data={data}
                      update={update}
                      toggleArr={toggleArr}
                      errors={errors}
                    />
                  )}
                  {step === 3 && (
                    <StepProblems
                      data={data}
                      update={update}
                      toggleArr={toggleArr}
                      errors={errors}
                    />
                  )}
                  {step === 4 && (
                    <StepBudget
                      data={data}
                      update={update}
                      toggleArr={toggleArr}
                      errors={errors}
                    />
                  )}
                  {step === 5 && (
                    <StepTimeline
                      data={data}
                      update={update}
                      toggleArr={toggleArr}
                      errors={errors}
                    />
                  )}
                  {step === 6 && (
                    <StepContact
                      data={data}
                      update={update}
                      toggleArr={toggleArr}
                      errors={errors}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={back}
                  disabled={step === 0 || submitting}
                  className="text-white/70 hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>

                <motion.button
                  type="button"
                  onClick={next}
                  disabled={submitting}
                  whileHover={submitting ? {} : { y: -2, ...G.primaryBtnHover }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium text-white disabled:opacity-50"
                  style={G.primaryBtn}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : step === STEPS.length - 1 ? (
                    <>Submit application</>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ============================================================ */
/*  Sticky Progress                                              */
/* ============================================================ */

function StickyProgress({
  step,
  progress,
}: {
  step: number;
  progress: number;
}) {
  return (
    <div className="sticky top-2 z-30 sm:top-4">
      <div className="rounded-xl px-2 py-3 sm:glass-card sm:px-5 sm:py-4">
        {/* Mobile: compact current step */}
        <div className="mb-2.5 flex items-center justify-between sm:hidden">
          <span className="section-index text-white">
            0{step + 1} — {STEPS[step].label}
          </span>
          <span className="section-index">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Desktop: all steps */}
        <div className="mb-2.5 hidden items-center gap-2 overflow-x-auto sm:flex section-index">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "whitespace-nowrap transition-colors duration-200",
                  i < step && "text-primary/60",
                  i === step && "text-white",
                  i > step && "text-white/70/40",
                )}
              >
                0{i + 1} {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="text-white/70/25">·</span>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="h-px overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: G.purple,
              boxShadow: "0 0 8px rgba(139,125,255,0.5)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Shared field components                                      */
/* ============================================================ */

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
    <div className="space-y-4 sm:space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-lg font-medium text-foreground sm:text-sm">
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-white/70">
              (optional)
            </span>
          )}
        </Label>
        {hint && (
          <span className="text-[11px] text-white/70">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-xs" style={{ color: "#F87171" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 sm:mb-10">
      <span className="section-index hidden sm:block">{eyebrow}</span>
      <h2 className="font-display text-4xl leading-[1.05] tracking-[-0.02em] sm:mt-4 sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
          {subtitle}
        </p>
      )}
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
        "group relative flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200",
        active
          ? "border-primary/45 bg-primary/10 text-white"
          : "border-border text-white/70 hover:border-white/15 hover:bg-white/[0.03] hover:text-white",
      )}
      style={
        active
          ? { boxShadow: "0 0 14px rgba(139,125,255,0.14)" }
          : undefined
      }
    >
      <span
        className={cn(
          "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border transition-all duration-200",
          active ? "border-primary bg-primary" : "border-border",
        )}
      >
        {active && <Check className="h-2 w-2 text-white" />}
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
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "group relative border p-3 sm:p-6 text-left transition-all duration-200 rounded-xl h-full",
        active
          ? "border-primary/40 bg-primary/8 text-white"
          : "border-border bg-transparent text-foreground hover:border-white/12 hover:bg-white/[0.02]",
      )}
      style={
        active
          ? { boxShadow: "0 0 24px rgba(139,125,255,0.12)" }
          : undefined
      }
    >
      <div className="flex h-full flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <span className="font-display text-xs leading-[1.15] tracking-tight sm:text-xl">{children}</span>
        <span
          className={cn(
            "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-all duration-200 self-end sm:h-5 sm:w-5 sm:self-auto",
            active ? "border-primary bg-primary" : "border-border",
          )}
        >
          {active && <Check className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />}
        </span>
      </div>
    </motion.button>
  );
}

/* ============================================================ */
/*  Step Components                                              */
/* ============================================================ */

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
      <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
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
          <Select
            value={data.business_size}
            onValueChange={(v) => update("business_size", v)}
          >
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
        <p className="mb-3 mt-1 text-xs text-white/70">
          Select all that apply.
        </p>
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-3">
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
        <p className="mt-3 text-xs" style={{ color: "#F87171" }}>
          {errors.services_required}
        </p>
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
        <p className="mt-3 text-xs" style={{ color: "#F87171" }}>
          {errors.project_goals}
        </p>
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
        placeholder={`Describe what's slowing your business down.\n\nExamples:\n• Losing leads through WhatsApp with no follow-up\n• Slow website — bounce rate 70%+\n• No online presence at all\n• Manual data entry between tools\n• Poor conversion on our landing page`}
        className="min-h-[200px] resize-none rounded-xl bg-card/50 p-5 leading-relaxed"
      />
      {errors.current_problems && (
        <p className="mt-2 text-xs" style={{ color: "#F87171" }}>
          {errors.current_problems}
        </p>
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-3">
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
      {errors.budget && (
        <p className="mt-3 text-xs" style={{ color: "#F87171" }}>
          {errors.budget}
        </p>
      )}
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
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
      {errors.timeline && (
        <p className="mt-3 text-xs" style={{ color: "#F87171" }}>
          {errors.timeline}
        </p>
      )}
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
      <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
        <Field label="Full name" error={errors.full_name}>
          <Input
            value={data.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            placeholder="Priya Sharma"
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
          <p className="mt-2 text-xs" style={{ color: "#F87171" }}>
            {errors.preferred_contact}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Success Screen                                               */
/* ============================================================ */

function SuccessScreen() {
  return (
    <section className="pointer-events-none relative z-10 mx-auto max-w-[1400px] px-6 pb-36 pt-8 sm:px-10">
      <div className="pointer-events-auto mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span
          className="section-index"
          style={{ color: "rgba(139,125,255,0.7)" }}
        >
          03 / Received
        </span>
        <span className="section-index hidden sm:block">
          Reply within 24 hours
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl"
      >
        <h2 className="font-display text-6xl leading-[0.97] tracking-[-0.025em] sm:text-8xl">
          Application
          <br />
          <span style={purpleText(true)}>received.</span>
        </h2>

        <GlowingText className="mt-10 max-w-xl text-lg leading-relaxed">
          Thanks for the detail. A partner will personally review your intake
          and reply within twenty-four hours. If it's a fit, we'll schedule a
          discovery call to scope the build.
        </GlowingText>

        <div className="pointer-events-auto mt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <motion.a
            href="https://cal.com"
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -2, ...G.primaryBtnHover }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-base font-medium text-white"
            style={G.primaryBtn}
          >
            Book discovery call
            <ExternalLink className="h-4 w-4" />
          </motion.a>
          <a
            href="/"
            className="section-index transition-colors hover:text-white"
          >
            ← Back to home
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ============================================================ */
/*  FAQ Section                                                  */
/* ============================================================ */

function FAQSection() {
  return (
    <section
      id="faq"
      className="pointer-events-none relative z-10 mx-auto max-w-[1400px] px-6 pb-36 sm:px-10"
    >
      <div className="pointer-events-auto mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">05 / FAQ</span>
        <span className="section-index hidden sm:block">
          Still curious?{" "}
          <a
            href="tel:+919123374792"
            className="transition-colors hover:text-white"
            style={{ color: "rgba(139,125,255,0.7)" }}
          >
            +91 91233 74792
          </a>
          {" "}·{" "}
          <a
            href="tel:+918777021228"
            className="transition-colors hover:text-white"
            style={{ color: "rgba(139,125,255,0.7)" }}
          >
            +91 87770 21228
          </a>
        </span>
      </div>

      <div className="grid gap-14 sm:grid-cols-12">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="font-display text-5xl leading-[0.97] tracking-[-0.025em] sm:col-span-5 sm:text-7xl"
        >
          Questions
          <br />
          <span style={purpleText(true)}>worth</span>
          <br />
          answering.
        </motion.h2>

        <Accordion
          type="single"
          collapsible
          className="pointer-events-auto sm:col-span-7"
        >
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b border-border first:border-t"
            >
              <AccordionTrigger className="py-6 text-left font-display text-xl tracking-tight hover:no-underline sm:text-2xl">
                <span className="flex items-baseline gap-4">
                  <span
                    className="section-index shrink-0"
                    style={{ color: "rgba(139,125,255,0.4)" }}
                  >
                    0{i + 1}
                  </span>
                  {f.q}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pl-12 text-base leading-relaxed text-white/70">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  Footer                                                       */
/* ============================================================ */

function Footer() {
  return (
    <footer className="pointer-events-none relative z-10 border-t border-border">
      <div className="pointer-events-auto mx-auto max-w-[1400px] px-6 py-20 sm:px-10">
        {/* Large editorial wordmark */}
        <div className="overflow-hidden">
          <div className="text-compressed text-[16vw] leading-[0.85] tracking-[-0.04em] sm:text-[13rem]">
            <span>Techilla</span>
            <span className="text-white/70/22">Techilla</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 section-index sm:flex-row sm:items-center">
          <div className="flex gap-4">
            <span>Studio · Web · Software · AI</span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
            <a
              href="tel:+919123374792"
              className="transition-colors"
              style={{ color: "rgba(139,125,255,0.7)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#8B7DFF")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(139,125,255,0.7)")
              }
            >
              +91 91233 74792
            </a>
            <span className="hidden sm:inline-block text-white/70/30">|</span>
            <a
              href="tel:+918777021228"
              className="transition-colors"
              style={{ color: "rgba(139,125,255,0.7)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#8B7DFF")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(139,125,255,0.7)")
              }
            >
              +91 87770 21228
            </a>
            <span className="hidden sm:inline-block text-white/70/30">|</span>
            <a
              href="mailto:hello@techilla.online"
              className="transition-colors"
              style={{ color: "rgba(139,125,255,0.7)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#8B7DFF")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(139,125,255,0.7)")
              }
            >
              hello@techilla.online
            </a>
            <span className="hidden sm:inline-block text-white/70/30">|</span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="transition-colors hover:text-white uppercase tracking-wider text-white/70"
            >
              Back to Top ↑
            </button>
          </div>
          <span>© {new Date().getFullYear()} — All rights reserved</span>
        </div>

      </div>
    </footer>
  );
}
