import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowRight, Search, MapPin, Briefcase, Clock } from "lucide-react";
import { jobs } from "@/lib/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialLinks } from "@/components/SocialLinks";

export const Route = createFileRoute("/careers/")({
  head: () => ({
    meta: [
      { title: "Careers | Techilla — Business Process Automation" },
      {
        name: "description",
        content:
          "Join Techilla's remote-first team. Help small and mid-sized businesses automate inefficient processes and manual workflows.",
      },
      { property: "og:title", content: "Careers | Techilla" },
      {
        property: "og:description",
        content:
          "Remote roles at a business process automation company. Consultative selling, real business outcomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          jobs.map((j) => ({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: j.title,
            description: j.short,
            employmentType: "CONTRACTOR",
            hiringOrganization: {
              "@type": "Organization",
              name: "Techilla",
              sameAs: "https://techilla.online",
            },
            jobLocationType: "TELECOMMUTE",
            applicantLocationRequirements: { "@type": "Country", name: j.location },
          })),
        ),
      },
    ],
  }),
  component: CareersPage,
});

const benefits = [
  { icon: "🌍", title: "Remote-first", desc: "Work from anywhere, on your own rhythm." },
  { icon: "💸", title: "Performance Rewards", desc: "Uncapped earning based on outcomes." },
  { icon: "🚀", title: "Startup Growth", desc: "Grow alongside a fast-moving studio." },
  { icon: "📚", title: "Learn Every Day", desc: "Access to premium learning resources." },
  { icon: "🤝", title: "Supportive Team", desc: "Small, kind, senior team. No politics." },
  { icon: "⚡", title: "Flexible Hours", desc: "Deep-work friendly, async by default." },
];

const stats = [
  { k: "50+", v: "Projects Delivered" },
  { k: "30+", v: "Clients Served" },
  { k: "12", v: "Countries" },
  { k: "100%", v: "Remote" },
];

function CareersPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("All");

  const departments = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))],
    [],
  );

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchQ =
        !q ||
        (j.title + j.short + j.department + j.location).toLowerCase().includes(q.toLowerCase());
      const matchD = dept === "All" || j.department === dept;
      return matchQ && matchD;
    });
  }, [q, dept]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-tight">
            Techilla
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/careers" className="text-foreground">Careers</Link>
          </nav>
          <SocialLinks size={16} />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground mb-8"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            We're hiring · Remote-first
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight"
          >
            Help Businesses <em className="italic text-primary/90">Automate</em> the Work That Slows Them Down.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
          >
            Techilla is a process automation company. Join a remote-first team helping
            small and mid-sized businesses replace manual processes with technology that works.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="rounded-full">
              <a href="#openings">
                View Open Positions <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/15">
              <Link to="/">Learn About Techilla</Link>
            </Button>
          </motion.div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.v} className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-6">
                <div className="font-display text-3xl md:text-4xl">{s.k}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">01 / Why</div>
            <h2 className="font-display text-3xl md:text-5xl mt-2">Why join Techilla</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-colors"
            >
              <div className="text-2xl">{b.icon}</div>
              <h3 className="mt-4 font-medium text-lg">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Openings */}
      <section id="openings" className="mx-auto max-w-6xl px-6 py-20 border-t border-white/5">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              02 / Openings
            </div>
            <h2 className="font-display text-3xl md:text-5xl mt-2">Open positions</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search roles"
                className="pl-9 w-56 bg-white/[0.03] border-white/10"
              />
            </div>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="h-10 rounded-md bg-white/[0.03] border border-white/10 px-3 text-sm"
            >
              {departments.map((d) => (
                <option key={d} value={d} className="bg-background">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filtered.length === 0 && (
            <p className="text-muted-foreground py-16 text-center">
              No positions match your filters. Check back soon.
            </p>
          )}
          {filtered.map((job) => (
            <Link
              key={job.slug}
              to="/careers/$slug"
              params={{ slug: job.slug }}
              className="group block rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8 hover:bg-white/[0.04] hover:border-white/15 transition-colors"
            >
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[260px]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-display text-2xl md:text-3xl tracking-tight">
                      {job.title}
                    </h3>
                    {job.badge && (
                      <span className="text-[10px] uppercase tracking-widest bg-primary/15 text-primary border border-primary/30 rounded-full px-2 py-0.5">
                        {job.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-muted-foreground max-w-2xl">{job.short}</p>
                  <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> {job.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {job.experience}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                  View Details <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-20 border-t border-white/5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">03 / FAQ</div>
        <h2 className="font-display text-3xl md:text-5xl mt-2 mb-10">Applicant questions</h2>
        <div className="space-y-3">
          {[
            {
              q: "Is this a full-time role?",
              a: "No. This is a remote, independent contractor position with performance-based compensation.",
            },
            {
              q: "Can freshers apply?",
              a: "Absolutely. If you have strong communication and drive, we welcome your application.",
            },
            {
              q: "When are payouts processed?",
              a: "Payouts are processed monthly after verification of successfully closed client projects.",
            },
            {
              q: "How long does the hiring process take?",
              a: "Typically 5–10 business days from application to offer for shortlisted candidates.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 open:bg-white/[0.04]"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between font-medium">
                {f.q}
                <span className="text-muted-foreground group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-12 flex items-center justify-between flex-wrap gap-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Techilla · Careers
          </p>
          <SocialLinks size={16} />
        </div>
      </footer>
    </div>
  );
}
