import { useEffect, useState, useCallback, type FormEvent } from "react";
import { ArrowBigUp, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAnonId } from "@/lib/anon-id";
import { toast } from "sonner";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export function BlogEngagement({ postSlug }: { postSlug: string }) {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [voting, setVoting] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const anonId = typeof window !== "undefined" ? getAnonId() : "ssr";

  const load = useCallback(async () => {
    setLoadingComments(true);
    const [{ data: votes }, { data: cmts }] = await Promise.all([
      supabase.from("blog_upvotes").select("anon_id").eq("post_slug", postSlug),
      supabase
        .from("blog_comments")
        .select("id,author_name,body,created_at")
        .eq("post_slug", postSlug)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    setUpvoteCount(votes?.length ?? 0);
    setHasUpvoted(!!votes?.some((v) => v.anon_id === anonId));
    setComments((cmts as Comment[]) ?? []);
    setLoadingComments(false);
  }, [postSlug, anonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleUpvote = async () => {
    if (voting) return;
    setVoting(true);
    if (hasUpvoted) {
      setHasUpvoted(false);
      setUpvoteCount((c) => Math.max(0, c - 1));
      const { error } = await supabase
        .from("blog_upvotes")
        .delete()
        .eq("post_slug", postSlug)
        .eq("anon_id", anonId);
      if (error) {
        toast.error("Couldn't remove upvote");
        void load();
      }
    } else {
      setHasUpvoted(true);
      setUpvoteCount((c) => c + 1);
      const { error } = await supabase
        .from("blog_upvotes")
        .insert({ post_slug: postSlug, anon_id: anonId });
      if (error) {
        // likely unique violation — refresh state
        void load();
      }
    }
    setVoting(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (trimmed.length < 1) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("blog_comments")
      .insert({
        post_slug: postSlug,
        anon_id: anonId,
        author_name: name.trim() || "Anonymous",
        body: trimmed,
      })
      .select("id,author_name,body,created_at")
      .single();
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't post comment");
      return;
    }
    setComments((prev) => [data as Comment, ...prev]);
    setBody("");
    toast.success("Comment posted");
  };

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={toggleUpvote}
          disabled={voting}
          aria-pressed={hasUpvoted}
          className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
            hasUpvoted
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-card text-foreground hover:border-primary/60"
          }`}
        >
          <ArrowBigUp
            className={`h-5 w-5 transition-transform ${hasUpvoted ? "scale-110 fill-current" : "group-hover:-translate-y-0.5"}`}
          />
          <span className="font-medium">{upvoteCount}</span>
          <span className="text-xs text-muted-foreground">
            {hasUpvoted ? "Upvoted" : "Upvote"}
          </span>
        </button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length} comments</span>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            maxLength={60}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:w-64"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts…"
          rows={3}
          maxLength={2000}
          required
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Comments are public. Be kind.
          </span>
          <button
            type="submit"
            disabled={submitting || body.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Post comment
          </button>
        </div>
      </form>

      <ul className="mt-10 space-y-6">
        {loadingComments && (
          <li className="text-sm text-muted-foreground">Loading comments…</li>
        )}
        {!loadingComments && comments.length === 0 && (
          <li className="text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts.
          </li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl border border-border bg-card/40 p-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-foreground">{c.author_name}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">
              {c.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
