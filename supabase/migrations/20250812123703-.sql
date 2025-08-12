-- Fix security warnings: Set immutable search_path for all functions to prevent SQL injection
-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update the increment_visitor_count function  
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.visitor_analytics (date, visitor_count) 
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (date) 
    DO UPDATE SET visitor_count = visitor_analytics.visitor_count + 1;
END;
$$;

-- Update the increment_idea_count function
CREATE OR REPLACE FUNCTION public.increment_idea_count(idea_category text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.idea_analytics (date, category, submission_count) 
    VALUES (CURRENT_DATE, idea_category, 1)
    ON CONFLICT (date, category) 
    DO UPDATE SET submission_count = idea_analytics.submission_count + 1;
END;
$$;