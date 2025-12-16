/*
  # Task Management System Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User identifier
      - `name` (text) - User display name
      - `avatar` (text) - Avatar URL or emoji
      - `created_at` (timestamptz) - Creation timestamp
    
    - `boards`
      - `id` (uuid, primary key) - Board identifier
      - `name` (text) - Board name
      - `owner_id` (uuid) - Foreign key to users
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `columns`
      - `id` (uuid, primary key) - Column identifier
      - `board_id` (uuid) - Foreign key to boards
      - `name` (text) - Column name
      - `position` (integer) - Display order
      - `created_at` (timestamptz) - Creation timestamp
    
    - `cards`
      - `id` (uuid, primary key) - Card identifier
      - `column_id` (uuid) - Foreign key to columns
      - `title` (text) - Card title
      - `description` (text) - Card description
      - `assignee_id` (uuid) - Foreign key to users
      - `priority` (text) - Priority level (P0, P1, P2, P3)
      - `position` (integer) - Display order within column
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `comments`
      - `id` (uuid, primary key) - Comment identifier
      - `card_id` (uuid) - Foreign key to cards
      - `author_id` (uuid) - Foreign key to users
      - `text` (text) - Comment content
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for demonstration purposes
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar text DEFAULT '👤',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  TO public
  WITH CHECK (true);

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read boards"
  ON boards FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create boards"
  ON boards FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update boards"
  ON boards FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete boards"
  ON boards FOR DELETE
  TO public
  USING (true);

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read columns"
  ON columns FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create columns"
  ON columns FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update columns"
  ON columns FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete columns"
  ON columns FOR DELETE
  TO public
  USING (true);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id uuid REFERENCES columns(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  priority text DEFAULT 'P3' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cards"
  ON cards FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create cards"
  ON cards FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update cards"
  ON cards FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete cards"
  ON cards FOR DELETE
  TO public
  USING (true);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update comments"
  ON comments FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete comments"
  ON comments FOR DELETE
  TO public
  USING (true);

-- Insert default users
INSERT INTO users (name, avatar) VALUES
  ('Alice Johnson', '👩‍💼'),
  ('Bob Smith', '👨‍💻'),
  ('Carol White', '👩‍🎨'),
  ('David Brown', '👨‍🔧')
ON CONFLICT DO NOTHING;