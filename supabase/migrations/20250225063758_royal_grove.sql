/*
  # Add upload permissions and user profiles

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `role` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users
    - Update lecture policies for uploads
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Update lectures table to track uploader
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS uploader_id uuid REFERENCES auth.users(id);

-- Allow authenticated users to insert lectures
CREATE POLICY "Authenticated users can upload lectures"
  ON lectures
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Create a trigger to create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();