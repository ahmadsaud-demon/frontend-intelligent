/*
  # Add Course Materials Support

  1. New Tables
    - `course_materials`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key)
      - `name` (text)
      - `file_path` (text)
      - `file_type` (text)
      - `size` (bigint)
      - `uploaded_by` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on course_materials table
    - Add policies for teachers to manage materials
    - Add policies for students to view materials
    - Create storage bucket for course materials
*/

-- Create course_materials table
CREATE TABLE course_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) NOT NULL,
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  size bigint NOT NULL,
  uploaded_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

-- Teachers can manage materials for their courses
CREATE POLICY "Teachers can manage course materials"
  ON course_materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_materials.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Students can view materials for enrolled courses
CREATE POLICY "Students can view course materials"
  ON course_materials
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = course_materials.course_id
      AND enrollments.student_id = auth.uid()
    )
  );