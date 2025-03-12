/*
  # Add RAG Support

  1. New Tables
    - `document_embeddings`
      - `id` (uuid, primary key)
      - `material_id` (uuid, foreign key)
      - `content` (text)
      - `embedding` (vector)
      - `created_at` (timestamp)
    
    - `document_qa`
      - `id` (uuid, primary key)
      - `material_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `question` (text)
      - `answer` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for course participants
*/

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create document_embeddings table
CREATE TABLE document_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES course_materials(id) NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

-- Create document_qa table
CREATE TABLE document_qa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES course_materials(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_qa ENABLE ROW LEVEL SECURITY;

-- Document embeddings policies
CREATE POLICY "Course participants can view embeddings"
  ON document_embeddings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_materials
      JOIN courses ON courses.id = course_materials.course_id
      WHERE course_materials.id = document_embeddings.material_id
      AND (
        courses.teacher_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM enrollments
          WHERE enrollments.course_id = courses.id
          AND enrollments.student_id = auth.uid()
        )
      )
    )
  );

-- Document QA policies
CREATE POLICY "Course participants can view QA"
  ON document_qa
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_materials
      JOIN courses ON courses.id = course_materials.course_id
      WHERE course_materials.id = document_qa.material_id
      AND (
        courses.teacher_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM enrollments
          WHERE enrollments.course_id = courses.id
          AND enrollments.student_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create their own QA entries"
  ON document_qa
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM course_materials
      JOIN courses ON courses.id = course_materials.course_id
      WHERE course_materials.id = material_id
      AND (
        courses.teacher_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM enrollments
          WHERE enrollments.course_id = courses.id
          AND enrollments.student_id = auth.uid()
        )
      )
    )
  );