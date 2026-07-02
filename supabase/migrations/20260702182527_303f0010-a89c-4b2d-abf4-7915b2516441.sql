
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  business_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  city TEXT,
  country TEXT,
  business_size TEXT,
  online_presence TEXT[] DEFAULT '{}',
  services_required TEXT[] DEFAULT '{}',
  project_goals TEXT[] DEFAULT '{}',
  current_problems TEXT,
  budget TEXT,
  timeline TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  preferred_contact TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT,
  assigned_to TEXT,
  last_contacted TIMESTAMPTZ
);

GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
