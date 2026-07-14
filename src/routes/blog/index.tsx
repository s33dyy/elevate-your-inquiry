import { createFileRoute, Link } from "@tanstack/react-router";
import { blogPosts } from "@/lib/blog-posts";
import { SocialLinks } from "@/components/SocialLinks";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Techilla" },
      {
        name: "description",
        content:
          "Field notes from Techilla: deep learning, web engineering, AI automation, and the craft behind our client work.",
      },
      { property: "og:title", content: "Blog — Techilla" },
      {
        property: "og:description",
        content:
          "Field notes from Techilla on deep learning, web engineering, and AI automation.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <div className="mb-16">
          <span className="section-index">01 — Journal</span>
          <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-tight text-foreground sm:text-7xl">
            Notes from the studio.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Deep dives on the projects, experiments, and ideas that shape how we build.
          </p>
        </div>

        <div className="space-y-px overflow-hidden rounded-2xl border border-border">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group block bg-card p-8 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="section-index">{post.date}</span>
                <span className="text-muted-foreground">·</span>
                <span className="section-index">{post.readingTime}</span>
              </div>
              <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-4xl">
                {post.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-display text-2xl tracking-tight text-foreground">
          Techilla
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            to="/blog"
            className="section-index hover:text-white"
            activeOptions={{ exact: true }}
            activeProps={{ style: { color: "white" } }}
          >
            Blog
          </Link>
          <Link
            to="/"
            hash="apply"
            className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Apply
          </Link>
        </nav>
      </div>
    </header>
  );
}
