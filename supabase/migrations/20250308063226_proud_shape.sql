/*
  # Add Chat Support

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for course participants to access chat rooms
    - Add policies for message creation and viewing
*/

-- Create chat_rooms table
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat room access policies
CREATE POLICY "Course participants can access chat rooms"
  ON chat_rooms
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = chat_rooms.course_id
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

-- Chat message policies
CREATE POLICY "Course participants can view messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      JOIN courses ON courses.id = chat_rooms.course_id
      WHERE chat_rooms.id = chat_messages.room_id
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

CREATE POLICY "Course participants can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms
      JOIN courses ON courses.id = chat_rooms.course_id
      WHERE chat_rooms.id = chat_messages.room_id
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