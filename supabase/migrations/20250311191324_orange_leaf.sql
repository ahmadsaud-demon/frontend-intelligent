/*
  # Add RLS policies for courses table

  1. Security
    - Enable RLS on courses table
    - Add policies for:
      - Teachers can manage their own courses
      - School admins can manage all courses
      - All authenticated users can view courses
*/

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Allow teachers to manage their own courses
CREATE POLICY "Teachers can manage their own courses"
ON courses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'teacher'
    AND users.id = courses.teacher_id
  )
);

-- Allow school admins to manage all courses
CREATE POLICY "School admins can manage all courses"
ON courses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'school_admin'
  )
);

-- Allow all authenticated users to view courses
CREATE POLICY "All users can view courses"
ON courses
FOR SELECT
TO authenticated
USING (true);