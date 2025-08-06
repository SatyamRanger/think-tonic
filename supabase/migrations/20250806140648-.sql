-- Create users table for registration
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ideas table
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('daily_hurdles', 'blue_yonder', 'kinaxis', 'coupa', 'manhattan', 'other_scm')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitor analytics table
CREATE TABLE public.visitor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  visitor_count INTEGER DEFAULT 1,
  UNIQUE(date)
);

-- Create idea analytics table  
CREATE TABLE public.idea_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  submission_count INTEGER DEFAULT 1,
  UNIQUE(date, category)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own data
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (id = id);

-- Ideas policies
CREATE POLICY "Anyone can view ideas" ON public.ideas FOR SELECT USING (true);
CREATE POLICY "Users can create ideas" ON public.ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own ideas" ON public.ideas FOR UPDATE USING (user_id = user_id);

-- Analytics policies (read-only for everyone)
CREATE POLICY "Anyone can view visitor analytics" ON public.visitor_analytics FOR SELECT USING (true);
CREATE POLICY "Anyone can view idea analytics" ON public.idea_analytics FOR SELECT USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment visitor count
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS void AS $$
BEGIN
    INSERT INTO public.visitor_analytics (date, visitor_count) 
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (date) 
    DO UPDATE SET visitor_count = visitor_analytics.visitor_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to increment idea submission count
CREATE OR REPLACE FUNCTION public.increment_idea_count(idea_category TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO public.idea_analytics (date, category, submission_count) 
    VALUES (CURRENT_DATE, idea_category, 1)
    ON CONFLICT (date, category) 
    DO UPDATE SET submission_count = idea_analytics.submission_count + 1;
END;
$$ LANGUAGE plpgsql;