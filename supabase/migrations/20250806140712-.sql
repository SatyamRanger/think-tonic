-- Fix security warnings by setting search_path for functions
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.increment_visitor_count();
DROP FUNCTION IF EXISTS public.increment_idea_count(TEXT);

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.visitor_analytics (date, visitor_count) 
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (date) 
    DO UPDATE SET visitor_count = visitor_analytics.visitor_count + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_idea_count(idea_category TEXT)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.idea_analytics (date, category, submission_count) 
    VALUES (CURRENT_DATE, idea_category, 1)
    ON CONFLICT (date, category) 
    DO UPDATE SET submission_count = idea_analytics.submission_count + 1;
END;
$$;