/*
  # Set up public schema and users table
  
  1. Changes
    - Create public.users table with necessary columns
    - Enable RLS on users table
    - Create RLS policies for user access control
  
  2. Security
    - Enable row level security
    - Add policies for user data access
    - Ensure proper role validation
*/

-- Create public.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'school_admin')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
  DROP POLICY IF EXISTS "School admins can manage all users" ON public.users;
END $$;

-- Create RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read their own data'
  ) THEN
    CREATE POLICY "Users can read their own data"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'School admins can manage all users'
  ) THEN
    CREATE POLICY "School admins can manage all users"
    ON public.users
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'school_admin'
      )
    );
  END IF;
END $$;

-- Create admin user in public schema
INSERT INTO public.users (
  id,
  email,
  full_name,
  role
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'admin@school.com',
  'School Administrator',
  'school_admin'
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;