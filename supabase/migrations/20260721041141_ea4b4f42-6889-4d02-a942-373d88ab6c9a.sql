
DROP POLICY IF EXISTS "Published posts are public" ON public.blog_posts;

CREATE POLICY "Anyone can read published posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can read all posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'));
