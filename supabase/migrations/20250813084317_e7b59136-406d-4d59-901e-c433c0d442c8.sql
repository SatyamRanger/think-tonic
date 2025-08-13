-- Add foreign key relationship between articles and users
ALTER TABLE public.articles 
ADD CONSTRAINT articles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;