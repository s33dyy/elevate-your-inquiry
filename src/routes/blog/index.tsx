import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { blogPosts, type BlogPost, type BlogBlock } from "@/lib/blog-posts";
import { supabase } from "@/integrations/supabase/client";
import { BlogTopBar } from "@/components/BlogTopBar";
import { ArrowRight } from "lucide-react";

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
  const dbQuery = useQuery({
    queryKey: ["blog_posts_public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        author: r.author,
        date: r.date_label,
        readingTime: r.reading_time,
        tags: r.tags ?? [],
        heroImage: r.hero_image ?? undefined,
        heroAlt: r.hero_alt ?? undefined,
        tldr: r.tldr ?? [],
        blocks: (r.blocks as unknown as BlogBlock[]) ?? [],
      })) as BlogPost[];
    },
  });

  const allPosts = [...(dbQuery.data ?? []), ...blogPosts];
  const [featured, ...rest] = allPosts;

  return (
    <div className="min-h-screen bg-background">
      <BlogTopBar />
      <main className="mx-auto max-w-6xl px-6 pt-28 pb-24 sm:pt-32">
        <div className="mb-14">
          <span className="section-index">01 — Journal</span>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-7xl">
            Notes from the studio.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Deep dives on the projects, experiments, and ideas that shape how we build.
          </p>
        </div>

        {featured && <FeatureCard post={featured} />}

        {rest.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

type Post = BlogPost;


function FeatureCard({ post }: { post: Post }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group grid overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary/60 md:grid-cols-2"
    >
      {post.heroImage && (
        <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
          <img
            src={post.heroImage}
            alt={post.heroAlt ?? post.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col justify-between gap-6 p-8 sm:p-10">
        <div>
          <div className="flex items-center gap-3 text-xs">
            <span className="section-index">Featured</span>
            <span className="text-muted-foreground">·</span>
            <span className="section-index">{post.date}</span>
            <span className="text-muted-foreground">·</span>
            <span className="section-index">{post.readingTime}</span>
          </div>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-4xl">
            {post.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-sm text-primary">
            Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/60"
    >
      {post.heroImage ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.heroImage}
            alt={post.heroAlt ?? post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-primary/30 via-background to-background" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="section-index">{post.date}</span>
          <span className="text-muted-foreground">·</span>
          <span className="section-index">{post.readingTime}</span>
        </div>
        <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
