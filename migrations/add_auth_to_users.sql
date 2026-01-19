-- Migration: Ajouter authentification aux users
-- Date: 2024-12-17

-- Ajouter les colonnes email et password
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Mettre à jour les utilisateurs existants avec des emails par défaut
UPDATE users SET email = LOWER(REPLACE(name, ' ', '.')) || '@jirafe.local' WHERE email IS NULL;
UPDATE users SET password_hash = '$2a$10$dummy.hash.for.migration' WHERE password_hash IS NULL;

-- Rendre email obligatoire maintenant qu'on a des valeurs
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Créer un index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Afficher les comptes créés
SELECT id, name, email FROM users ORDER BY created_at;


