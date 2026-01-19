-- ============================================
-- JIRAFE Database Schema - COMPLETE
-- PostgreSQL Local avec Auth + Workspaces
-- ============================================

-- Clean start
DROP TABLE IF EXISTS card_activities CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS card_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS columns CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (avec auth)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  password_hash text,
  avatar text DEFAULT '👤',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspaces table
CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  avatar text DEFAULT '🏢',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create boards table (avec workspace_id)
CREATE TABLE boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create columns table
CREATE TABLE columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create cards table
CREATE TABLE cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id uuid REFERENCES columns(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  priority text DEFAULT 'P3' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  position integer NOT NULL DEFAULT 0,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  board_id uuid REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, board_id)
);

-- Create card_tags junction table
CREATE TABLE card_tags (
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (card_id, tag_id)
);

-- Create subtasks table
CREATE TABLE subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create card_activities table
CREATE TABLE card_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  field_name text,
  old_value text,
  new_value text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX idx_columns_board_id ON columns(board_id);
CREATE INDEX idx_cards_column_id ON cards(column_id);
CREATE INDEX idx_cards_due_date ON cards(due_date);
CREATE INDEX idx_comments_card_id ON comments(card_id);
CREATE INDEX idx_tags_board_id ON tags(board_id);
CREATE INDEX idx_card_tags_card_id ON card_tags(card_id);
CREATE INDEX idx_card_tags_tag_id ON card_tags(tag_id);
CREATE INDEX idx_subtasks_card_id ON subtasks(card_id);
CREATE INDEX idx_card_activities_card_id ON card_activities(card_id);
CREATE INDEX idx_card_activities_created_at ON card_activities(created_at DESC);

-- ============================================
-- DATA INITIALIZATION
-- ============================================

-- Insert test users avec mots de passe hashés (password123)
-- ⚠️ Note: Ces hash sont des placeholders. Après avoir exécuté init-db.sql,
--    lance "node scripts/create-test-users.js" pour générer les vrais hash
-- Tous les users ont le mot de passe "password123" pour les tests
INSERT INTO users (name, email, password_hash, avatar) VALUES
  ('Alice Johnson', 'alice@jirafe.local', 'temp', '👩‍💼'),
  ('Bob Smith', 'bob@jirafe.local', 'temp', '👨‍💻'),
  ('Carol White', 'carol@jirafe.local', 'temp', '👩‍🎨'),
  ('David Brown', 'david@jirafe.local', 'temp', '👨‍🔧');

-- Create default workspace
INSERT INTO workspaces (name, avatar, created_by)
SELECT 'Espace de travail principal', '🏢', id 
FROM users 
WHERE email = 'alice@jirafe.local';

-- Add all users to the default workspace
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 
  (SELECT id FROM workspaces LIMIT 1) as workspace_id,
  u.id as user_id,
  CASE 
    WHEN u.email = 'alice@jirafe.local' THEN 'owner'
    ELSE 'member'
  END as role
FROM users u;

-- Create a sample board
INSERT INTO boards (name, owner_id, workspace_id)
SELECT 
  'Projet Principal',
  (SELECT id FROM users WHERE email = 'alice@jirafe.local'),
  (SELECT id FROM workspaces LIMIT 1);

-- Create default columns
INSERT INTO columns (board_id, name, position)
SELECT 
  b.id,
  col.name,
  col.position
FROM boards b
CROSS JOIN (
  VALUES 
    ('À faire', 0),
    ('En cours', 1),
    ('Terminé', 2)
) AS col(name, position)
WHERE b.name = 'Projet Principal';

-- Confirmation
SELECT 
  '✅ Base de données initialisée avec succès!' as status,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM workspaces) as workspaces_count,
  (SELECT COUNT(*) FROM workspace_members) as members_count,
  (SELECT COUNT(*) FROM boards) as boards_count,
  (SELECT COUNT(*) FROM columns) as columns_count;
