/*
  # Fix Authentication Setup

  1. Changes
    - Enable required extensions
    - Create auth schema and tables
    - Set up RLS policies with conflict checks
    - Create admin user in both auth and public schemas

  2. Security
    - Enable RLS on users table
    - Add policies for user data access
    - Ensure admin user has proper permissions
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure the auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE,
  encrypted_password text,
  email_confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  role text DEFAULT 'authenticated',
  aud text DEFAULT 'authenticated'
);

-- Create public.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
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

-- Create admin user
DO $$ 
BEGIN
  -- Create admin in auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    aud
  )
  VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'admin@school.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at;

  -- Create admin in public.users
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
END $$;