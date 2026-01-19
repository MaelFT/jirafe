-- Migration: Créer le système de workspaces
-- Date: 2024-12-17

-- 1. Créer la table workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  avatar TEXT DEFAULT '🏢',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la table workspace_members
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 3. Ajouter workspace_id à la table boards
ALTER TABLE boards ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- 4. Créer un workspace par défaut
INSERT INTO workspaces (id, name, slug, description, avatar, created_by)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Espace de travail principal',
  'default-workspace',
  'Workspace par défaut pour tous les utilisateurs',
  '🏢',
  (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- 5. Ajouter tous les utilisateurs existants au workspace par défaut
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  id,
  CASE 
    WHEN id = (SELECT id FROM users ORDER BY created_at LIMIT 1) THEN 'owner'
    ELSE 'member'
  END
FROM users
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- 6. Migrer tous les boards existants vers le workspace par défaut
UPDATE boards 
SET workspace_id = 'a0000000-0000-0000-0000-000000000001'
WHERE workspace_id IS NULL;

-- 7. Rendre workspace_id obligatoire maintenant qu'on a migré
ALTER TABLE boards ALTER COLUMN workspace_id SET NOT NULL;

-- 8. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_workspace ON boards(workspace_id);

-- 9. Afficher le résultat
SELECT 
  w.name as workspace,
  COUNT(DISTINCT wm.user_id) as members,
  COUNT(DISTINCT b.id) as boards
FROM workspaces w
LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
LEFT JOIN boards b ON w.id = b.workspace_id
GROUP BY w.id, w.name;


