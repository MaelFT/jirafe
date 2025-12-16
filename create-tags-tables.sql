-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  board_id uuid REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, board_id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tags"
  ON tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create tags"
  ON tags FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update tags"
  ON tags FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tags"
  ON tags FOR DELETE
  TO public
  USING (true);

-- Create card_tags junction table
CREATE TABLE IF NOT EXISTS card_tags (
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (card_id, tag_id)
);

ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read card_tags"
  ON card_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create card_tags"
  ON card_tags FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can delete card_tags"
  ON card_tags FOR DELETE
  TO public
  USING (true);
