import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  blogPosts,
  getPostBySlug,
  type BlogBlock,
  type BlogPost,
} from "@/lib/blog-posts";
import { supabase } from "@/integrations/supabase/client";
import { BlogTopBar } from "@/components/BlogTopBar";
import { BlogSidePanel } from "@/components/BlogSidePanel";
import { BlogEngagement } from "@/components/BlogEngagement";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    // Check DB first for published posts, then fall back to static
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", params.slug)
        .eq("published", true)
        .maybeSingle();
      if (data) {
        const post: BlogPost = {
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          author: data.author,
          date: data.date_label,
          readingTime: data.reading_time,
          tags: data.tags ?? [],
          heroImage: data.hero_image ?? undefined,
          heroAlt: data.hero_alt ?? undefined,
          tldr: data.tldr ?? [],
          blocks: (data.blocks as unknown as BlogBlock[]) ?? [],
        };
        return { post };
      }
    } catch {
      // ignore and fall through to static
    }
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Post not found — Techilla" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — Techilla` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt },
        ...(post.heroImage
          ? [
              { property: "og:image", content: post.heroImage },
              { name: "twitter:image", content: post.heroImage },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-display text-5xl">Post not found</h1>
        <Link
          to="/blog"
          className="mt-6 inline-block text-primary underline underline-offset-4"
        >
          Back to blog
        </Link>
      </div>
    </div>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData() as { post: BlogPost };

  // Live list of DB + static posts for the side panel
  const dbQuery = useQuery({
    queryKey: ["blog_posts_public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug,title,excerpt,date_label,reading_time,tags,hero_image,hero_alt")
        .eq("published", true)
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => ({
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        author: "Techilla",
        date: r.date_label,
        readingTime: r.reading_time,
        tags: r.tags ?? [],
        heroImage: r.hero_image ?? undefined,
        heroAlt: r.hero_alt ?? undefined,
        blocks: [] as BlogBlock[],
      })) as BlogPost[];
    },
  });

  const dbSlugs = new Set((dbQuery.data ?? []).map((p) => p.slug));
  const allPosts = [...(dbQuery.data ?? []), ...blogPosts.filter((p) => !dbSlugs.has(p.slug))];

  const _postForRender = post;
  return <BlogPostView post={_postForRender} sidePanelPosts={allPosts} />;
}

function BlogPostView({ post, sidePanelPosts }: { post: BlogPost; sidePanelPosts: BlogPost[] }) {


  return (
    <div className="min-h-screen bg-background">
      <BlogTopBar />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-28 pb-24 sm:pt-32 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="section-index">{post.date}</span>
              <span className="text-muted-foreground">·</span>
              <span className="section-index">{post.readingTime}</span>
              <span className="text-muted-foreground">·</span>
              <span className="section-index">{post.author}</span>
            </div>
            <h1 className="mt-6 font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>
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
          </div>

          {post.heroImage && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-border">
              <img
                src={post.heroImage}
                alt={post.heroAlt ?? post.title}
                width={1600}
                height={900}
                className="h-auto w-full"
              />
            </div>
          )}

          {post.tldr && post.tldr.length > 0 && (
            <div
              className="mb-12 rounded-2xl border p-6"
              style={{
                borderColor: "rgba(139,125,255,0.35)",
                background:
                  "linear-gradient(135deg, rgba(139,125,255,0.08), rgba(139,125,255,0.02))",
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: "#B4A9FF" }} />
                <span className="section-index" style={{ color: "#B4A9FF" }}>
                  AI TL;DR
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {post.tldr.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-foreground/90"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                      style={{ background: "rgba(139,125,255,0.85)" }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="prose-techilla space-y-6">
            {post.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>

          <BlogEngagement postSlug={post.slug} />

          <div className="mt-16 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/blog"
              className="section-index inline-flex items-center gap-2 hover:text-white"
            >
              ← Back to all posts
            </Link>
          </div>
        </article>

        <div className="lg:sticky lg:top-28 lg:h-max">
          <BlogSidePanel posts={sidePanelPosts} currentSlug={post.slug} />
        </div>
      </div>
    </div>
  );
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-base leading-relaxed text-foreground/85">{block.text}</p>;
    case "h2":
      return (
        <h2 className="mt-12 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
          {block.text}
        </h3>
      );
    case "quote":
      return (
        <blockquote className="my-8 border-l-2 border-primary pl-6 font-display text-2xl italic leading-snug text-foreground">
          {block.text}
        </blockquote>
      );
    case "ul":
      return (
        <ul className="ml-1 space-y-2">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-base leading-relaxed text-foreground/85"
            >
              <span
                className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                style={{ background: "rgba(139,125,255,0.7)" }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0f0f14] p-4 text-sm">
          <code className="font-mono text-foreground/90">{block.text}</code>
        </pre>
      );
    case "video":
      return (
        <div className="my-6 overflow-hidden rounded-2xl border border-border bg-black">
          <video
            src={block.src}
            controls
            playsInline
            preload="metadata"
            poster={block.poster}
            className="h-auto w-full"
          />
        </div>
      );
    case "image":
      return (
        <figure className="my-6 overflow-hidden rounded-2xl border border-border">
          <img
            src={block.src}
            alt={block.alt ?? ""}
            loading="lazy"
            className="h-auto w-full"
          />
          {block.caption && (
            <figcaption className="bg-card px-4 py-3 text-center text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}
