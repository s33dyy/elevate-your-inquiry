import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";

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

function useWebGLEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isDesktop || reduced) return;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (gl) setEnabled(true);
    } catch {
      /* no webgl */
    }
  }, []);
  return enabled;
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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
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
        {/* Wordmark */}
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

        {/* Links */}
        <nav className="hidden items-center gap-8 sm:flex">
          {(
            [
              ["#trust", "01", "Practice"],
              ["#apply", "02", "Apply"],
              ["#faq", "03", "FAQ"],
            ] as const
          ).map(([href, num, label]) => (
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

        {/* Mobile CTA */}
        <motion.a
          href="#apply"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="sm:hidden inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white"
          style={{
            background: "rgba(139,125,255,0.12)",
            border: "1px solid rgba(139,125,255,0.28)",
          }}
        >
          Apply
          <ArrowRight className="h-3 w-3" />
        </motion.a>

        {/* Desktop CTA */}
        <Magnetic cursor="button">
          <motion.a
            href="#apply"
            whileHover={{
              y: -1,
              boxShadow: "0 0 18px rgba(139,125,255,0.25)",
            }}
            transition={{ duration: 0.2 }}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white"
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
    </motion.header>
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
        <span className="section-index">00 / Introduction</span>
        <span className="section-index hidden sm:block">
          Now accepting projects · 2026
        </span>
      </motion.div>

      {/* Content grid */}
      <div className="grid items-center gap-12 lg:grid-cols-1">
        {/* Main column */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="relative">
            <h1 className="font-display leading-[0.92] tracking-[-0.03em] text-[clamp(2.6rem,11vw,8.8rem)]">
              Websites &amp; software
              <br />
              that{" "}
              <span style={purpleText(true)}>earn</span>
              {" "}their keep.
            </h1>
          </div>

          {/* Sub-copy grid */}
          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <p className="text-compressed text-xl leading-[0.93] text-white/75 sm:text-4xl">
                BoutiqueStudio
                <br />
                SinceDay1
              </p>
            </div>
            <GlowingText className="max-w-xl text-sm leading-relaxed sm:col-span-6 sm:col-start-7 sm:text-lg">
              Techilla is a boutique studio for founders who need more than a
              template. We build high-conversion websites, custom software, and
              AI automation for teams that actually ship. Tell us about your
              business — we respond within twenty-four hours.
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
                Begin application
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Magnetic>

            <a
              href="#faq"
              className="section-index transition-colors duration-200 hover:text-white"
            >
              → Read FAQ first
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
        <span className="section-index">01 / Practice</span>
        <span className="section-index hidden sm:block">
          What every project ships with
        </span>
      </div>

      <h2 className="mb-16 max-w-4xl font-display text-5xl leading-[0.97] tracking-[-0.025em] sm:text-7xl">
        A small studio,
        <br />
        <span style={purpleText(true)}>deliberately.</span>
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
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setShowForm(true);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const webgl = useWebGLEnabled();
  const reduced = useReducedMotion();

  return (
    <>
      <Suspense fallback={null}>
        {loading && <Preloader onDone={() => setLoading(false)} />}
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
          <HeroSculpture3D />
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
        <span className="section-index">02 / Portfolio</span>
        <span className="section-index hidden sm:block">
          Selected Web Experiences
        </span>
      </div>

      <div className="pointer-events-auto">
        <h2 className="mb-6 max-w-4xl font-display text-5xl leading-[0.97] tracking-[-0.025em] sm:text-7xl">
          Selected Web Experiences
        </h2>
        <GlowingText className="mb-16 max-w-2xl text-lg leading-relaxed">
          We collaborate quietly with sports studios, energy brands, art initiatives, crypto funds, and SaaS platforms to ship opinionated interfaces — and 50+ clients trust us with their web presence.
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
  return (
    <section
      id="pricing"
      className="pointer-events-none relative z-10 mx-auto max-w-[1400px] px-6 pb-20 sm:px-10"
    >
      <div className="pointer-events-auto mb-14 flex items-baseline justify-between border-t border-border pt-6">
        <span className="section-index">03 / Pricing</span>
        <span className="section-index hidden sm:block">
          Clear scope, honest pricing
        </span>
      </div>

      <div className="pointer-events-auto">
        <h2 className="mb-6 max-w-4xl font-display text-5xl leading-[0.97] tracking-[-0.025em] sm:text-7xl">
          Pricing &amp; Packages
        </h2>
        <GlowingText className="mb-16 max-w-2xl text-lg leading-relaxed">
          Two ways to get a website live — pick the one that fits, and everything below is included from day one.
        </GlowingText>

        <h3 className="mb-8 font-display text-3xl tracking-tight text-white/90">Website Packages</h3>
        <div className="mb-24 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
          {/* Web Plan 1 */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0 }}
            className="flex flex-col justify-between rounded-2xl border border-[rgba(139,125,255,0.15)] bg-card/10 p-5 backdrop-blur-md sm:p-10 transition-colors hover:border-[rgba(139,125,255,0.3)]"
          >
            <div>
              <h3 className="font-display text-2xl sm:text-3xl">No Domain</h3>
              <p className="hidden mt-3 min-h-[3rem] text-sm text-white/70 sm:block">
                Bring your own domain later — we build and host on ours to start.
              </p>

              <div className="my-3 border-y border-white/10 py-3 sm:my-8 sm:py-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl tracking-tight sm:text-6xl" style={purpleText(false)}>
                    ₹499
                  </span>
                  <span className="text-white/70 text-xs sm:text-base">/ mo</span>
                </div>
                <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-wider text-white/70/80 font-mono">
                  Setup fee: ₹1,499 one-time
                </div>
              </div>

              <ul className="mb-5 space-y-2 sm:mb-10 sm:space-y-4">
                {[
                  "Hosting up to 10k visitors/mo",
                  "1 major + 2 minor updates/month",
                  "Uptime monitoring",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary sm:h-4 sm:w-4" />
                    <span className="text-[10px] leading-tight sm:text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              onClick={onCta}
              whileHover={{ y: -2, ...G.primaryBtnHover }}
              whileTap={{ y: 0, scale: 0.98 }}
              className="w-full rounded-xl py-2 sm:py-4 text-[11px] sm:text-sm font-medium text-white transition-all"
              style={{
                background: "rgba(139,125,255,0.12)",
                border: "1px solid rgba(139,125,255,0.25)",
              }}
            >
              Start This Plan
            </motion.button>
          </motion.div>

          {/* Web Plan 2 */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.15 }}
            className="relative flex flex-col justify-between rounded-2xl border border-primary/40 bg-primary/5 p-5 backdrop-blur-md sm:p-10"
            style={{ boxShadow: "0 0 40px rgba(139,125,255,0.05)" }}
          >
            <div className="absolute -top-3 right-8 rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-wider text-white">
              MOST CHOSEN
            </div>
            
            <div>
              <h3 className="font-display text-2xl sm:text-3xl">With Domain</h3>
              <p className="hidden mt-3 min-h-[3rem] text-sm text-white/70 sm:block">
                Full setup on your own domain, live and indexed from launch.
              </p>

              <div className="my-3 border-y border-white/10 py-3 sm:my-8 sm:py-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl tracking-tight sm:text-6xl" style={purpleText(false)}>
                    ₹499
                  </span>
                  <span className="text-white/70 text-xs sm:text-base">/ mo</span>
                </div>
                <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-wider text-white/70/80 font-mono">
                  Setup fee: ₹2,999 one-time
                </div>
              </div>

              <ul className="mb-5 space-y-2 sm:mb-10 sm:space-y-4">
                {[
                  "Hosting up to 10k visitors/mo",
                  "1 major + 2 minor updates/month",
                  "Uptime monitoring",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary sm:h-4 sm:w-4" />
                    <span className="text-[10px] leading-tight sm:text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              onClick={onCta}
              whileHover={{ y: -2, ...G.primaryBtnHover }}
              whileTap={{ y: 0, scale: 0.98 }}
              className="w-full rounded-xl py-2 sm:py-4 text-[11px] sm:text-sm font-medium text-white transition-all"
              style={G.primaryBtn}
            >
              Start This Plan
            </motion.button>
          </motion.div>
        </div>

        <h3 className="mb-8 font-display text-3xl tracking-tight text-white/90">Custom Software &amp; AI Builds</h3>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
          {/* Plan 1 */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0 }}
            className="flex flex-col justify-between rounded-2xl border border-[rgba(139,125,255,0.15)] bg-card/10 p-5 backdrop-blur-md sm:p-10 transition-colors hover:border-[rgba(139,125,255,0.3)]"
          >
            <div>
              <h3 className="font-display text-2xl sm:text-3xl">One-Time Build</h3>
              <p className="hidden mt-3 min-h-[3rem] text-sm text-white/70 sm:block">
                The one-time build — planning, development, and getting it live in your stack.
              </p>

              <div className="my-3 border-y border-white/10 py-3 sm:my-8 sm:py-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl tracking-tight sm:text-6xl" style={purpleText(false)}>
                    ₹4,999 – ₹1L
                  </span>
                </div>
                <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-wider text-white/70/80 font-mono">
                  Priced after Discovery
                </div>
              </div>

              <ul className="mb-5 space-y-2 sm:mb-10 sm:space-y-4">
                {[
                  "Hosting up to 10k visitors/mo",
                  "Clear documentation, so you're never locked in",
                  "NDA on request",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary sm:h-4 sm:w-4" />
                    <span className="text-[10px] leading-tight sm:text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              onClick={onCta}
              whileHover={{ y: -2, ...G.primaryBtnHover }}
              whileTap={{ y: 0, scale: 0.98 }}
              className="w-full rounded-xl py-2 sm:py-4 text-[11px] sm:text-sm font-medium text-white transition-all"
              style={{
                background: "rgba(139,125,255,0.12)",
                border: "1px solid rgba(139,125,255,0.25)",
              }}
            >
              Apply to Work Together
            </motion.button>
          </motion.div>

          {/* Plan 2 */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.15 }}
            className="relative flex flex-col justify-between rounded-2xl border border-primary/40 bg-primary/5 p-5 backdrop-blur-md sm:p-10"
            style={{ boxShadow: "0 0 40px rgba(139,125,255,0.05)" }}
          >
            <div className="absolute -top-3 right-8 rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-wider text-white">
              ONGOING
            </div>
            
            <div>
              <h3 className="font-display text-2xl sm:text-3xl">Maintenance Subscription</h3>
              <p className="hidden mt-3 min-h-[3rem] text-sm text-white/70 sm:block">
                Monitoring and hands-on management of what's live, month to month.
              </p>

              <div className="my-3 border-y border-white/10 py-3 sm:my-8 sm:py-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl tracking-tight sm:text-6xl" style={purpleText(false)}>
                    ₹999 – ₹10K
                  </span>
                  <span className="text-white/70 text-xs sm:text-base">/ mo</span>
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider text-white/70/80 font-mono">
                  Scales with what you're running
                </div>
              </div>

              <ul className="mb-5 space-y-2 sm:mb-10 sm:space-y-4">
                {[
                  "Uptime & monitoring included",
                  "Bug fixes & stability checks",
                  "New feature work quoted separately",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary sm:h-4 sm:w-4" />
                    <span className="text-[10px] leading-tight sm:text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              onClick={onCta}
              whileHover={{ y: -2, ...G.primaryBtnHover }}
              whileTap={{ y: 0, scale: 0.98 }}
              className="w-full rounded-xl py-2 sm:py-4 text-[11px] sm:text-sm font-medium text-white transition-all"
              style={G.primaryBtn}
            >
              Apply to Work Together
            </motion.button>
          </motion.div>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-white/70">
            Free, always: Hosting · Uptime monitoring · Changelog — included with every plan, no extra line item.
          </p>
          <p className="text-xs text-white/70/60 section-index">
            Pricing is set after Discovery, based on scope · NDA available on request.
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
          <div className="flex gap-4 sm:gap-6 items-center">
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
