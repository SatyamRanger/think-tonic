-- Fix critical security vulnerability: Users table RLS policy allows public access to all user data
-- Drop the insecure policy that allows anyone to view all user data
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- Create a secure policy that only allows users to view their own data
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Also ensure the update policy is secure (currently has same issue)
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);