import { Link } from "@tanstack/react-router";
import type { BlogPost } from "@/lib/blog-posts";

export function BlogSidePanel({
  posts,
  currentSlug,
}: {
  posts: BlogPost[];
  currentSlug: string;
}) {
  const others = posts.filter((p) => p.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <aside className="space-y-4 rounded-2xl border border-border bg-card/40 p-5">
      <span className="section-index">Keep reading</span>
      <ul className="space-y-4">
        {others.map((p) => (
          <li key={p.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group block overflow-hidden rounded-xl border border-border/60 transition-colors hover:border-primary/60"
            >
              {p.heroImage && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={p.heroImage}
                    alt={p.heroAlt ?? p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="section-index">{p.date}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="section-index">{p.readingTime}</span>
                </div>
                <h3 className="mt-2 font-display text-lg leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {p.title}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
