/*
  # Create admin user and update role constraints

  1. Changes
    - Update users table role constraint to include 'school_admin'
    - Create admin user with proper role
    - Set up authentication for the admin user

  2. Security
    - Maintain existing RLS policies
    - Update role validation
*/

-- First modify the role constraint to allow 'school_admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role = ANY (ARRAY['student'::text, 'teacher'::text, 'school_admin'::text]));

-- Create admin user if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@school.com'
  ) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
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
      '00000000-0000-0000-0000-000000000000',
      '123e4567-e89b-12d3-a456-426614174000',
      'authenticated',
      'authenticated',
      'admin@school.com',
      crypt('admin123', gen_salt('bf')), -- Using 'admin123' as the password
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      ''
    );

    -- Insert into public.users
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
  END IF;
END $$;