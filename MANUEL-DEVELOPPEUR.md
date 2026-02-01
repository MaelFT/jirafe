# 👨‍💻 Manuel Développeur - Jirafe

**Version** : 2.0.0  
**Dernière mise à jour** : 01/02/2026

---

## 📋 Table des matières

1. [Architecture technique](#-architecture-technique)
2. [Technologies](#-technologies)
3. [Installation développement](#-installation-développement)
4. [Structure du projet](#-structure-du-projet)
5. [API REST](#-api-rest)
6. [Base de données](#-base-de-données)
7. [Authentification](#-authentification)
8. [Tests](#-tests)
9. [Contribution](#-contribution)
10. [Déploiement](#-déploiement)

---

## 🏗️ Architecture technique

### Vue d'ensemble

Jirafe suit une **architecture en couches** (Layered Architecture) :

```
┌─────────────────────────────────────┐
│   PRESENTATION LAYER                │
│   Components React + Zustand        │
│   - board-view.tsx                  │
│   - card-detail-modal.tsx           │
└──────────────┬──────────────────────┘
               ↓ HTTP/REST
┌──────────────▼──────────────────────┐
│   API LAYER                         │
│   Next.js API Routes                │
│   - app/api/auth/*                  │
│   - app/api/boards/*                │
│   - Middleware (authentification)   │
└──────────────┬──────────────────────┘
               ↓
┌──────────────▼──────────────────────┐
│   BUSINESS LOGIC LAYER              │
│   - lib/auth.ts (JWT, bcrypt)       │
│   - Validation                      │
│   - Règles métier                   │
└──────────────┬──────────────────────┘
               ↓
┌──────────────▼──────────────────────┐
│   DATA ACCESS LAYER                 │
│   - lib/database.ts (Repository)    │
│   - SQL Queries                     │
└──────────────┬──────────────────────┘
               ↓ SQL
┌──────────────▼──────────────────────┐
│   DATABASE                          │
│   PostgreSQL 16                     │
└─────────────────────────────────────┘
```

### Principes appliqués

- **Clean Architecture** : Séparation stricte des couches
- **SOLID Principles** : Single Responsibility, Open/Closed, etc.
- **DRY** (Don't Repeat Yourself) : Pas de duplication de code
- **Repository Pattern** : Abstraction de l'accès aux données
- **DTO Pattern** : Types TypeScript stricts pour les données

---

## 🛠️ Technologies

### Stack complet

**Frontend**
- Next.js 13.5 (App Router, Server Components)
- React 18.2
- TypeScript 5.2 (mode strict)
- Tailwind CSS 3.3
- shadcn/ui (composants UI)
- @dnd-kit (drag & drop)
- Zustand 5.0 (state management)
- date-fns (manipulation dates)

**Backend**
- Next.js API Routes (REST API)
- PostgreSQL 16
- node-postgres (pg) 8.16
- bcryptjs (hashage mots de passe)
- jose (JWT moderne)

**DevOps**
- Docker & Docker Compose
- Jest 30 (tests)
- ESLint (linting)
- TypeScript Compiler (typecheck)

---

## 💻 Installation développement

### Prérequis

```bash
node --version   # 18.x ou supérieur
npm --version    # 9.x ou supérieur
docker --version # 20.x ou supérieur
```

### Setup complet

```bash
# 1. Cloner le repository
git clone <url-du-repo>
cd jirafe

# 2. Installer les dépendances
npm install

# 3. Configuration (optionnel)
cp .env.example .env.local
# Éditer .env.local si nécessaire

# 4. Lancer la stack complète
npm run db:start          # PostgreSQL
sleep 3                   # Attendre que PostgreSQL démarre
npm run db:migrate        # Créer les tables
node scripts/create-test-users.js  # Utilisateurs de test
npm run dev               # Application

# 5. Ouvrir http://localhost:3000
```

### Variables d'environnement

Créer `.env.local` :

```env
# Base de données
PGHOST=localhost
PGPORT=5433
PGDATABASE=jirafe_db
PGUSER=jirafe
PGPASSWORD=jirafe_dev_2024

# Authentification
JWT_SECRET=your-super-secret-change-in-production

# Next.js
PORT=3000
NODE_ENV=development
```

---

## 📁 Structure du projet

```
jirafe/
├── app/                          # Application Next.js 13+
│   ├── api/                      # API Routes (Backend)
│   │   ├── auth/
│   │   │   ├── login/route.ts    # POST /api/auth/login
│   │   │   ├── signup/route.ts   # POST /api/auth/signup
│   │   │   ├── logout/route.ts   # POST /api/auth/logout
│   │   │   ├── me/route.ts       # GET /api/auth/me
│   │   │   └── profile/route.ts  # PUT /api/auth/profile
│   │   ├── workspaces/
│   │   │   ├── route.ts          # GET, POST /api/workspaces
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PATCH, DELETE
│   │   │       └── members/      # Gestion des membres
│   │   ├── boards/
│   │   │   ├── route.ts          # GET, POST /api/boards
│   │   │   └── [id]/route.ts     # GET, PATCH, DELETE
│   │   ├── cards/
│   │   │   ├── route.ts          # GET, POST /api/cards
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PATCH, DELETE
│   │   │       └── details/      # Détails enrichis
│   │   ├── columns/route.ts      # CRUD colonnes
│   │   ├── tags/route.ts         # CRUD tags
│   │   ├── comments/route.ts     # CRUD commentaires
│   │   ├── subtasks/route.ts     # CRUD sous-tâches
│   │   └── activities/route.ts   # Historique
│   │
│   ├── login/page.tsx            # Page connexion
│   ├── signup/page.tsx           # Page inscription
│   ├── profile/page.tsx          # Profil utilisateur
│   ├── workspace/
│   │   ├── [id]/                 # Détails workspace
│   │   │   └── settings/         # Paramètres
│   │   └── new/page.tsx          # Créer workspace
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Page principale (boards)
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants React
│   ├── ui/                       # Composants UI de base
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...                   # 20+ composants shadcn
│   ├── board-view.tsx            # Vue Kanban
│   ├── list-view.tsx             # Vue liste
│   ├── calendar-view.tsx         # Vue calendrier
│   ├── card-detail-modal.tsx     # Modal détails carte
│   ├── board-column.tsx          # Colonne de board
│   ├── task-card.tsx             # Carte de tâche
│   ├── board-selector.tsx        # Sélecteur de board
│   ├── workspace-selector.tsx    # Sélecteur de workspace
│   ├── user-selector.tsx         # Sélecteur utilisateur
│   └── search-filters.tsx        # Filtres et recherche
│
├── lib/                          # Logique métier
│   ├── auth.ts                   # Authentification
│   │   └── hashPassword()        # Hashage bcrypt
│   │   └── verifyPassword()      # Vérification
│   │   └── generateToken()       # Génération JWT
│   │   └── verifyToken()         # Vérification JWT
│   ├── database.ts               # Accès base de données
│   │   └── pool                  # Pool de connexions
│   │   └── query()               # Fonction de requête
│   │   └── Types (User, Board...) # Types exportés
│   ├── store.ts                  # State management Zustand
│   ├── types.ts                  # Types TypeScript
│   └── utils.ts                  # Utilitaires (cn, dates, etc.)
│
├── hooks/                        # Custom React Hooks
│   └── use-toast.ts              # Hook notifications
│
├── __tests__/                    # Tests Jest
│   ├── lib/
│   │   └── auth.test.ts          # Tests auth
│   └── api/
│       ├── auth/
│       │   ├── login.test.ts
│       │   └── signup.test.ts
│       ├── boards/route.test.ts
│       └── cards/route.test.ts
│
├── __mocks__/                    # Mocks pour tests
│   ├── jose.ts                   # Mock JWT
│   ├── pg.ts                     # Mock PostgreSQL
│   └── next/server.ts
│
├── migrations/                   # Migrations SQL
│   ├── create_workspaces.sql
│   └── add_auth_to_users.sql
│
├── scripts/                      # Scripts utilitaires
│   ├── create-test-users.js      # Créer utilisateurs
│   └── migrate.js                # Appliquer migrations
│
├── middleware.ts                 # Middleware Next.js (auth)
├── docker-compose.yml            # Config PostgreSQL
├── init-db.sql                   # Schéma initial DB
├── jest.config.js                # Config Jest
├── jest-node.config.js           # Config Jest API
├── tsconfig.json                 # Config TypeScript
├── tailwind.config.ts            # Config Tailwind
├── next.config.js                # Config Next.js
└── package.json                  # Dépendances
```

---

## 🔌 API REST

### Authentification

#### POST /api/auth/signup

Créer un nouveau compte.

**Request** :
```json
{
  "name": "Alice Dupont",
  "email": "alice@example.com",
  "password": "securePassword123",
  "avatar": "👩"
}
```

**Response 201** :
```json
{
  "user": {
    "id": "uuid",
    "name": "Alice Dupont",
    "email": "alice@example.com",
    "avatar": "👩",
    "created_at": "2026-02-01T10:00:00Z"
  }
}
```

**Errors** :
- `400` : Données invalides
- `409` : Email déjà utilisé

---

#### POST /api/auth/login

Se connecter et obtenir un token.

**Request** :
```json
{
  "email": "alice@example.com",
  "password": "securePassword123"
}
```

**Response 200** :
```json
{
  "user": {
    "id": "uuid",
    "name": "Alice Dupont",
    "email": "alice@example.com",
    "avatar": "👩"
  }
}
```

Un cookie `jirafe-auth-token` est défini (httpOnly, secure).

**Errors** :
- `400` : Données manquantes
- `401` : Identifiants invalides

---

#### GET /api/auth/me

Obtenir l'utilisateur connecté.

**Headers** :
```
Cookie: jirafe-auth-token=<jwt>
```

**Response 200** :
```json
{
  "user": {
    "id": "uuid",
    "name": "Alice Dupont",
    "email": "alice@example.com",
    "avatar": "👩"
  }
}
```

**Errors** :
- `401` : Non authentifié

---

### Workspaces

#### GET /api/workspaces

Lister les workspaces de l'utilisateur.

**Response 200** :
```json
{
  "workspaces": [
    {
      "id": "uuid",
      "name": "Mon Workspace",
      "slug": "mon-workspace",
      "description": "Description",
      "avatar": "🏢",
      "created_by": "user-uuid",
      "memberCount": 5,
      "boardCount": 3
    }
  ]
}
```

---

#### POST /api/workspaces

Créer un nouveau workspace.

**Request** :
```json
{
  "name": "Nouveau Workspace",
  "description": "Description optionnelle",
  "avatar": "🏢"
}
```

**Response 201** :
```json
{
  "workspace": {
    "id": "uuid",
    "name": "Nouveau Workspace",
    ...
  }
}
```

---

### Boards

#### GET /api/boards

Lister les boards (optionnel: filter par workspace).

**Query params** :
- `workspace_id` : UUID du workspace

**Response 200** :
```json
{
  "boards": [
    {
      "id": "uuid",
      "name": "Sprint 1",
      "workspace_id": "workspace-uuid",
      "owner_id": "user-uuid",
      "created_at": "2026-02-01T10:00:00Z"
    }
  ]
}
```

---

#### POST /api/boards

Créer un board.

**Request** :
```json
{
  "name": "Mon Board",
  "workspace_id": "workspace-uuid"
}
```

**Response 201** :
```json
{
  "board": {
    "id": "uuid",
    "name": "Mon Board",
    "workspace_id": "workspace-uuid",
    "owner_id": "user-uuid"
  }
}
```

---

### Cards

#### GET /api/cards

Lister les cartes (filter par board).

**Query params** :
- `board_id` : UUID du board (requis)

**Response 200** :
```json
{
  "cards": [
    {
      "id": "uuid",
      "title": "Ma tâche",
      "description": "Description",
      "column_id": "column-uuid",
      "assignee_id": "user-uuid",
      "priority": "high",
      "due_date": "2026-02-10",
      "created_at": "2026-02-01T10:00:00Z"
    }
  ]
}
```

---

#### POST /api/cards

Créer une carte.

**Request** :
```json
{
  "title": "Nouvelle tâche",
  "description": "Description détaillée",
  "column_id": "column-uuid",
  "assignee_id": "user-uuid",
  "priority": "medium",
  "due_date": "2026-02-15"
}
```

**Response 201** :
```json
{
  "card": {
    "id": "uuid",
    "title": "Nouvelle tâche",
    ...
  }
}
```

---

#### PATCH /api/cards/[id]

Modifier une carte.

**Request** :
```json
{
  "title": "Titre modifié",
  "column_id": "new-column-uuid"
}
```

**Response 200** :
```json
{
  "card": {
    "id": "uuid",
    "title": "Titre modifié",
    ...
  }
}
```

---

#### DELETE /api/cards/[id]

Supprimer une carte.

**Response 200** :
```json
{
  "success": true,
  "message": "Card deleted"
}
```

---

### Autres endpoints

**Columns** : `/api/columns` - CRUD des colonnes  
**Tags** : `/api/tags` - CRUD des tags  
**Comments** : `/api/comments` - CRUD des commentaires  
**Subtasks** : `/api/subtasks` - CRUD des sous-tâches  
**Activities** : `/api/activities` - Historique des activités

---

## 💾 Base de données

### Schéma

```sql
-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(10) DEFAULT '👤',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  avatar VARCHAR(10) DEFAULT '🏢',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membres de workspace
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Boards
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Colonnes
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cartes
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  start_date DATE,
  position INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Association cartes-tags
CREATE TABLE card_tags (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, tag_id)
);

-- Sous-tâches
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  position INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Commentaires
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activités
CREATE TABLE card_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes pour performance

```sql
CREATE INDEX idx_cards_column_id ON cards(column_id);
CREATE INDEX idx_cards_assignee_id ON cards(assignee_id);
CREATE INDEX idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_comments_card_id ON comments(card_id);
CREATE INDEX idx_activities_card_id ON card_activities(card_id);
```

### Migrations

```bash
# Appliquer les migrations
npm run db:migrate

# Shell PostgreSQL
npm run db:shell

# Réinitialiser la DB (⚠️)
npm run db:reset
```

---

## 🔐 Authentification

### Architecture

1. **Inscription** : Mot de passe hashé avec bcrypt (10 rounds)
2. **Connexion** : Génération d'un JWT valide 7 jours
3. **Cookie** : Token stocké dans cookie httpOnly, secure, sameSite
4. **Middleware** : Vérifie le token sur chaque requête
5. **Protection** : Routes privées nécessitent authentification

### Implémentation

**lib/auth.ts** :
```typescript
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret'
);

// Hashage mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Vérification mot de passe
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Génération JWT
export async function generateToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Vérification JWT
export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch {
    return null;
  }
}
```

**middleware.ts** :
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const COOKIE_NAME = 'jirafe-auth-token';
const PUBLIC_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorer les fichiers statiques
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Routes publiques
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Vérifier authentification
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 🧪 Tests

### Stratégie

- **Tests unitaires** : Fonctions pures (auth, utils)
- **Tests d'intégration** : API endpoints
- **Couverture** : 85%

### Exécuter les tests

```bash
# Tous les tests
npm test

# Tests unitaires
npm run test:unit

# Tests API
npm run test:api

# Mode watch
npm run test:watch

# Couverture
npm run test:coverage
```

### Exemple de test

```typescript
// __tests__/lib/auth.test.ts
import { hashPassword, verifyPassword } from '@/lib/auth';

describe('Authentication', () => {
  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'myPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toHaveLength(60);
    });
  });
  
  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'myPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
    
    it('should reject wrong password', async () => {
      const password = 'myPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });
});
```

---

## 🤝 Contribution

### Workflow Git

```bash
# 1. Créer une branche
git checkout -b feature/my-feature

# 2. Faire des commits
git add .
git commit -m "feat: add new feature"

# 3. Pousser
git push origin feature/my-feature

# 4. Créer une Pull Request
```

### Convention de commits

Format : `<type>(<scope>): <description>`

**Types** :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `refactor` : Refactoring
- `docs` : Documentation
- `test` : Tests
- `chore` : Maintenance

**Exemples** :
```
feat(boards): add drag and drop
fix(auth): prevent infinite redirect
refactor(database): extract repository pattern
docs(readme): update installation steps
test(api): add card endpoints tests
```

### Checklist PR

- [ ] Code compile (`npm run build`)
- [ ] Types valides (`npm run typecheck`)
- [ ] Linter OK (`npm run lint`)
- [ ] Tests passent (`npm test`)
- [ ] Documentation à jour

---

## 🚀 Déploiement

### Build de production

```bash
npm run build
npm start
```

### Variables d'environnement production

```env
# Base de données (Production)
PGHOST=your-db-host.com
PGPORT=5432
PGDATABASE=jirafe_prod
PGUSER=jirafe_prod
PGPASSWORD=strong-production-password

# Authentification (Production)
JWT_SECRET=very-strong-secret-min-32-chars

# Next.js
NODE_ENV=production
```

### Docker

```bash
# Build de l'image
docker build -t jirafe:2.0.0 .

# Lancer le conteneur
docker run -p 3000:3000 \
  -e PGHOST=db \
  -e JWT_SECRET=your-secret \
  jirafe:2.0.0
```

---

## 📚 Ressources

- **Architecture** : [ARCHITECTURE-PATTERNS.md](ARCHITECTURE-PATTERNS.md)
- **Manuel utilisateur** : [MANUEL-UTILISATEUR.md](MANUEL-UTILISATEUR.md)
- **Next.js** : https://nextjs.org/docs
- **PostgreSQL** : https://www.postgresql.org/docs/

---

**Version** : 2.0.0  
**Dernière mise à jour** : 01/02/2026
