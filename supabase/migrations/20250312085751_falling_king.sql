/*
  # Add System Admin Role and Update Schema

  1. Changes
    - Update role constraint to include system_admin
    - Create initial system admin user
    - Update RLS policies for system admin access

  2. Security
    - Enable RLS
    - Add policies for system admin access
*/

-- Update role constraint to include system_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role = ANY (ARRAY['system_admin'::text, 'school_admin'::text, 'teacher'::text, 'student'::text]));

-- Create system admin policies
CREATE POLICY "System admins can manage all schools"
  ON schools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'system_admin'
    )
  );

CREATE POLICY "System admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'system_admin'
    )
  );

-- Create initial system admin user if not exists
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  school_id
)
VALUES (
  gen_random_uuid(),
  'admin@edumanager.com',
  'System Administrator',
  'system_admin',
  NULL
)
ON CONFLICT (email) DO UPDATE
SET role = 'system_admin';