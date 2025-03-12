/*
  # Fix Authentication Setup - Public Schema Only

  1. Changes
    - Set up public schema tables and policies
    - Configure role constraints
    - Set up RLS policies for user access

  2. Security
    - Enable RLS on users table
    - Add policies for user access control
*/

-- First modify the role constraint to allow 'school_admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role = ANY (ARRAY['student'::text, 'teacher'::text, 'school_admin'::text]));

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    -- Check and create "Users can read their own data" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can read their own data'
    ) THEN
        CREATE POLICY "Users can read their own data"
        ON users
        FOR SELECT
        TO authenticated
        USING (
            auth.uid() = id
        );
    END IF;

    -- Check and create "School admins can manage all users" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'School admins can manage all users'
    ) THEN
        CREATE POLICY "School admins can manage all users"
        ON users
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'school_admin'
            )
        );
    END IF;
END $$;

-- Ensure admin user exists in public schema
INSERT INTO users (
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