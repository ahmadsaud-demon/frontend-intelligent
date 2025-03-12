/*
  # Set up Public Schema for Authentication

  1. Changes
    - Create public.users table with proper structure
    - Enable RLS on users table
    - Set up policies for user access control
    - Create initial admin user in public schema

  2. Security
    - Enable RLS
    - Add policies for user data access
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'school_admin')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "School admins can manage all users" ON public.users;

-- Create RLS policies
CREATE POLICY "Users can read their own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

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

-- Create initial admin user
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