/*
  # Create lectures table and related schemas

  1. New Tables
    - `lectures`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `video_url` (text)
      - `thumbnail_url` (text)
      - `instructor` (text)
      - `week_number` (integer)
      - `course_id` (text)
      - `rating` (integer)
      - `views` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `lectures` table
    - Add policies for authenticated users to read lectures
*/

CREATE TABLE IF NOT EXISTS lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  instructor text NOT NULL,
  week_number integer NOT NULL,
  course_id text NOT NULL,
  rating integer DEFAULT 0,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectures are viewable by everyone"
  ON lectures
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO lectures (title, description, video_url, thumbnail_url, instructor, week_number, course_id, rating, views) VALUES
('Introduction to Programming', 'Learn the basics of programming concepts', 'https://www.youtube.com/watch?v=example1', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80', 'Dr. Sarah Johnson', 1, 'foundation-1', 4, 156),
('Data Structures Fundamentals', 'Understanding basic data structures', 'https://www.youtube.com/watch?v=example2', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=600&q=80', 'Prof. Michael Chen', 2, 'foundation-1', 5, 234),
('Advanced Algorithms', 'Deep dive into algorithmic concepts', 'https://www.youtube.com/watch?v=example3', 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?auto=format&fit=crop&w=600&q=80', 'Dr. Emily Brown', 3, 'foundation-1', 4, 189);