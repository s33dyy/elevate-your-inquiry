
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  anon_id text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX blog_comments_slug_idx ON public.blog_comments(post_slug, created_at DESC);
GRANT SELECT, INSERT ON public.blog_comments TO anon, authenticated;
GRANT ALL ON public.blog_comments TO service_role;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.blog_comments FOR INSERT WITH CHECK (true);

CREATE TABLE public.blog_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  anon_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_slug, anon_id)
);
CREATE INDEX blog_upvotes_slug_idx ON public.blog_upvotes(post_slug);
GRANT SELECT, INSERT, DELETE ON public.blog_upvotes TO anon, authenticated;
GRANT ALL ON public.blog_upvotes TO service_role;
ALTER TABLE public.blog_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read upvotes" ON public.blog_upvotes FOR SELECT USING (true);
CREATE POLICY "Anyone can upvote" ON public.blog_upvotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove their upvote" ON public.blog_upvotes FOR DELETE USING (true);
