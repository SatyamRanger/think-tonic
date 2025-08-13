-- Add new columns to ideas table for implementation tracking
ALTER TABLE public.ideas 
ADD COLUMN implementation_status TEXT NOT NULL DEFAULT 'new_proposal',
ADD COLUMN solution_implemented TEXT,
ADD COLUMN benefit_realization TEXT;

-- Add check constraint for implementation_status
ALTER TABLE public.ideas 
ADD CONSTRAINT ideas_implementation_status_check 
CHECK (implementation_status IN ('new_proposal', 'already_implemented'));