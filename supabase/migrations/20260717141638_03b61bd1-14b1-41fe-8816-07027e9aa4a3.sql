
CREATE TABLE public.job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  job_slug text NOT NULL DEFAULT 'business-development-executive',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text,
  linkedin text,
  portfolio text,
  education text,
  experience text,
  current_occupation text,
  joining_date text,
  lead_strategy text,
  why_join text,
  resume_url text,
  cover_letter_url text,
  status text NOT NULL DEFAULT 'New',
  notes text
);

GRANT INSERT ON public.job_applications TO anon, authenticated;
GRANT SELECT, UPDATE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can apply" ON public.job_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view applications" ON public.job_applications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications" ON public.job_applications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can upload resume"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Admins can read resumes"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'::app_role));
