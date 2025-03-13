/*
  # Add Multi-tenant and White Labeling Support

  1. New Tables
    - `schools` - Stores school/tenant information
      - `id` (uuid, primary key)
      - `name` (text)
      - `domain` (text, unique)
      - `logo_url` (text)
      - `primary_color` (text)
      - `secondary_color` (text)
      - `created_at` (timestamp)
    
    - Add school_id to users table
    - Add school-based policies

  2. Security
    - Enable RLS on schools table
    - Add policies for school access
*/

-- Create schools table
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#4F46E5',
  secondary_color text DEFAULT '#4338CA',
  created_at timestamptz DEFAULT now()
);

-- Add school_id to users
ALTER TABLE users ADD COLUMN school_id uuid REFERENCES schools(id);
CREATE INDEX idx_users_school_id ON users(school_id);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own school"
  ON schools
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT school_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage their school"
  ON schools
  FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT school_id 
      FROM users 
      WHERE users.id = auth.uid()
      AND users.role = 'school_admin'
    )
  );

-- Update existing policies to be school-aware
DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    school_id IN (
      SELECT school_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "School admins can manage all users" ON users;
CREATE POLICY "School admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'school_admin'
      AND admin.school_id = users.school_id
    )
  );

-- Add school_id to courses
ALTER TABLE courses ADD COLUMN school_id uuid REFERENCES schools(id);
CREATE INDEX idx_courses_school_id ON courses(school_id);

-- Update courses policies to be school-aware
DROP POLICY IF EXISTS "Teachers can manage their own courses" ON courses;
CREATE POLICY "Teachers can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'teacher'
      AND users.school_id = courses.school_id
      AND users.id = courses.teacher_id
    )
  );

DROP POLICY IF EXISTS "School admins can manage all courses" ON courses;
CREATE POLICY "School admins can manage all courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'school_admin'
      AND users.school_id = courses.school_id
    )
  );

DROP POLICY IF EXISTS "All users can view courses" ON courses;
CREATE POLICY "All users can view courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );