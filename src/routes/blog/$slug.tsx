import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPostBySlug, type BlogBlock } from "@/lib/blog-posts";
import { SocialLinks } from "@/components/SocialLinks";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
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
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData() as { post: NonNullable<ReturnType<typeof getPostBySlug>> };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-nav fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-2xl tracking-tight text-foreground">
            Techilla
          </Link>
          <Link to="/blog" className="section-index hover:text-white">
            ← All posts
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="section-index">{post.date}</span>
            <span className="text-muted-foreground">·</span>
            <span className="section-index">{post.readingTime}</span>
            <span className="text-muted-foreground">·</span>
            <span className="section-index">{post.author}</span>
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl">
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

        <div className="prose-techilla space-y-6">
          {post.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <Link
            to="/blog"
            className="section-index inline-flex items-center gap-2 hover:text-white"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
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
  }
}
