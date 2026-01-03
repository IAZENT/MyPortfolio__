BEGIN;

-- Add show_on_home and home_priority to projects, blog_posts, certifications
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS show_on_home boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS home_priority integer DEFAULT NULL;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS show_on_home boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS home_priority integer DEFAULT NULL;

ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS show_on_home boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS home_priority integer DEFAULT NULL;

COMMIT;
