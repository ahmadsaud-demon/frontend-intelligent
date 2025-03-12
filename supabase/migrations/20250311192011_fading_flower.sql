/*
  # Set up authentication schema and admin user

  1. Changes
    - Enable required extensions
    - Set up auth schema
    - Create admin user in both auth and public schemas

  2. Security
    - Maintain existing RLS policies
    - Ensure proper authentication setup
*/

-- Enable auth schema extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Create or update admin user
DO $$ 
BEGIN 
  -- Delete existing admin user if exists to ensure clean state
  DELETE FROM auth.users WHERE email = 'admin@school.com';
  DELETE FROM public.users WHERE email = 'admin@school.com';

  -- Create new admin user
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@school.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    ''
  );

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
  );
END $$;