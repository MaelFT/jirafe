-- Add due_date to cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS due_date timestamptz;

-- Create subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create card_activities table for history tracking
CREATE TABLE IF NOT EXISTS card_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action_type text NOT NULL, -- 'created', 'updated', 'moved', 'commented', 'archived'
  field_name text, -- 'title', 'description', 'status', 'priority', 'assignee', 'due_date'
  old_value text,
  new_value text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subtasks
CREATE POLICY "Anyone can read subtasks"
  ON subtasks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert subtasks"
  ON subtasks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update subtasks"
  ON subtasks FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete subtasks"
  ON subtasks FOR DELETE
  TO public
  USING (true);

-- RLS Policies for card_activities
CREATE POLICY "Anyone can read card_activities"
  ON card_activities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert card_activities"
  ON card_activities FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subtasks_card_id ON subtasks(card_id);
CREATE INDEX IF NOT EXISTS idx_card_activities_card_id ON card_activities(card_id);
CREATE INDEX IF NOT EXISTS idx_card_activities_created_at ON card_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);
