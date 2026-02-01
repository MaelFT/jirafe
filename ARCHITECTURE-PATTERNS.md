# 🏛️ Architecture & Design Patterns - Jirafe

**Version** : 2.0.0  
**Dernière mise à jour** : 01/02/2026

---

## 📋 Table des matières

1. [Introduction](#-introduction)
2. [Design Patterns Créationnels](#-design-patterns-créationnels)
3. [Design Patterns Structurels](#-design-patterns-structurels)
4. [Design Patterns Comportementaux](#-design-patterns-comportementaux)
5. [Domain-Driven Design (DDD)](#-domain-driven-design-ddd)
6. [Principes SOLID](#-principes-solid)
7. [Architecture en couches](#-architecture-en-couches)
8. [Sécurité](#-sécurité)

---

## 🎯 Introduction

Ce document analyse en profondeur l'architecture du projet Jirafe, en détaillant les design patterns utilisés et l'application du Domain-Driven Design (DDD).

### Objectifs architecturaux

1. **Maintenabilité** : Code facile à comprendre et modifier
2. **Extensibilité** : Ajout de fonctionnalités sans casser l'existant
3. **Testabilité** : Tests unitaires et d'intégration efficaces
4. **Scalabilité** : Support de la croissance du système
5. **Sécurité** : Protection des données et des accès

---

## 🏗️ Design Patterns Créationnels

Les patterns créationnels concernent la création d'objets de manière contrôlée et optimisée.

### 1. Singleton Pattern

**Définition** : Garantir qu'une classe n'a qu'une seule instance et fournir un point d'accès global.

**Utilisation dans Jirafe** : `lib/database.ts`

```typescript
import { Pool } from 'pg';

// Configuration du pool PostgreSQL
const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5433'),
  database: process.env.PGDATABASE || 'jirafe_db',
  user: process.env.PGUSER || 'jirafe',
  password: process.env.PGPASSWORD || 'jirafe_dev_2024',
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
};

// ✅ UNE SEULE instance du pool dans toute l'application
export const pool = new Pool(config);
```

**Pourquoi Singleton ?**
- ✅ Une seule instance du pool de connexions
- ✅ Réutilisation des connexions PostgreSQL (performance)
- ✅ Gestion centralisée du cycle de vie
- ✅ Évite les fuites mémoire (pas de pools multiples)

**Avantages** :
- Performance : Les connexions sont réutilisées
- Mémoire : Pas de duplication des pools
- Configuration : Un seul point de configuration

**Inconvénients potentiels** :
- Test : Peut compliquer les tests (mais Node.js le gère bien)
- État global : Partagé dans toute l'application

---

### 2. Factory Pattern

**Définition** : Créer des objets sans spécifier leur classe exacte, déléguer la création à une méthode factory.

**Utilisation dans Jirafe** : `app/api/auth/signup/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password, avatar } = body;
  
  // 1. Créer l'utilisateur
  const hashedPassword = await hashPassword(password);
  const userResult = await query(
    `INSERT INTO users (name, email, password_hash, avatar) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hashedPassword, avatar || '👤']
  );
  const user = userResult.rows[0];
  
  // 2. ✅ FACTORY : Créer automatiquement un workspace pour l'utilisateur
  const workspaceName = `Espace de ${name}`;
  const workspaceResult = await query(
    `INSERT INTO workspaces (name, avatar, created_by) 
     VALUES ($1, $2, $3) RETURNING *`,
    [workspaceName, '🏢', user.id]
  );
  const workspace = workspaceResult.rows[0];
  
  // 3. ✅ FACTORY : Ajouter l'utilisateur comme owner du workspace
  await query(
    `INSERT INTO workspace_members (workspace_id, user_id, role) 
     VALUES ($1, $2, 'owner')`,
    [workspace.id, user.id]
  );
  
  return NextResponse.json({ user }, { status: 201 });
}
```

**Pourquoi Factory ?**
- ✅ Création cohérente : Chaque utilisateur a automatiquement son workspace
- ✅ Encapsulation : La logique de création est centralisée
- ✅ Évite les oublis : Impossible de créer un utilisateur sans workspace

**Avantages** :
- Cohérence des données
- Logique de création réutilisable
- Facilite les tests (mock de la factory)

---

## 🔨 Design Patterns Structurels

Les patterns structurels concernent la composition de classes et d'objets.

### 3. Repository Pattern

**Définition** : Abstraction de l'accès aux données, séparant la logique métier de la persistence.

**Utilisation dans Jirafe** : `lib/database.ts`

```typescript
// ✅ REPOSITORY : Abstraction de l'accès aux données
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

// Utilisation dans les API routes
// app/api/boards/route.ts
export async function GET(request: NextRequest) {
  // Les API routes utilisent query() sans connaître PostgreSQL
  const boards = await query(
    'SELECT * FROM boards WHERE owner_id = $1',
    [userId]
  );
  return NextResponse.json({ boards: boards.rows });
}
```

**Pourquoi Repository ?**
- ✅ Abstraction : Les API routes ne connaissent pas les détails de PostgreSQL
- ✅ Testabilité : On peut facilement mocker `query()`
- ✅ Changement de DB : Demain, on peut passer à MongoDB sans toucher aux API routes
- ✅ Centralisation : Tous les logs de requêtes passent par un point unique

**Avantages** :
- Séparation des préoccupations
- Tests facilités (mock du repository)
- Migration de DB simplifiée
- Logging centralisé

**Principe SOLID appliqué** : **Dependency Inversion Principle**
- Les modules de haut niveau (API routes) ne dépendent pas des détails (PostgreSQL)
- Ils dépendent d'une abstraction (fonction `query`)

---

### 4. Proxy Pattern

**Définition** : Fournir un substitut ou placeholder pour contrôler l'accès à un objet.

**Utilisation dans Jirafe** : API Routes Next.js

```typescript
// app/api/boards/[id]/route.ts

// ✅ PROXY : Les API routes agissent comme proxy entre le client et la DB
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. CONTRÔLE : Authentification
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. CONTRÔLE : Autorisation
  const boardCheck = await query(
    'SELECT owner_id FROM boards WHERE id = $1',
    [params.id]
  );
  if (boardCheck.rows[0]?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 3. CONTRÔLE : Validation
  const body = await request.json();
  if (!body.name || body.name.length < 3) {
    return NextResponse.json(
      { error: 'Name must be at least 3 characters' },
      { status: 400 }
    );
  }
  
  // 4. ACCÈS à la ressource réelle (DB)
  const result = await query(
    'UPDATE boards SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [body.name, params.id]
  );
  
  // 5. TRANSFORMATION de la réponse
  return NextResponse.json({ board: result.rows[0] });
}
```

**Pourquoi Proxy ?**
- ✅ Contrôle d'accès : Vérification auth/authz avant d'accéder à la DB
- ✅ Validation : Les données sont validées côté serveur
- ✅ Transformation : Les données peuvent être enrichies/filtrées
- ✅ Cache : Possibilité d'ajouter du cache facilement
- ✅ Logging : Point d'interception pour monitorer

**Avantages** :
- Sécurité renforcée (validation serveur)
- Séparation client/serveur
- Point unique de contrôle

---

### 5. Decorator Pattern

**Définition** : Ajouter des responsabilités à un objet dynamiquement.

**Utilisation dans Jirafe** : `lib/auth.ts`

```typescript
// ✅ DECORATOR : Ajoute la fonctionnalité de hashage au mot de passe
export async function hashPassword(password: string): Promise<string> {
  // Décoration : transformation du password en hash sécurisé
  return bcrypt.hash(password, 10);
}

// Utilisation
const password = "myPassword123";
const decoratedPassword = await hashPassword(password);
// Le password est maintenant "décoré" avec un hash bcrypt

// ✅ DECORATOR : Ajoute la fonctionnalité de vérification
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Pourquoi Decorator ?**
- ✅ Séparation : La logique de hashage est isolée
- ✅ Réutilisabilité : Utilisable partout dans l'application
- ✅ Flexibilité : On peut changer l'algorithme de hashage facilement
- ✅ Clean Code : Les API routes ne connaissent pas bcrypt

**Avantages** :
- Responsabilité unique
- Code métier propre
- Changement d'algorithme facile

---

## 🎭 Design Patterns Comportementaux

Les patterns comportementaux concernent la communication entre objets.

### 6. Observer Pattern

**Définition** : Définir une dépendance one-to-many pour que quand un objet change d'état, tous ses dépendants soient notifiés.

**Utilisation dans Jirafe** : `lib/store.ts` avec Zustand

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AppStore = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  viewMode: 'board' | 'list' | 'calendar';
  setViewMode: (mode: 'board' | 'list' | 'calendar') => void;
};

// ✅ OBSERVER : Le store observable
export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // État observable
      currentUser: null,
      currentWorkspace: null,
      viewMode: 'board',
      
      // Méthodes pour modifier l'état (notifie les observers)
      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: 'jirafe-storage' }
  )
);

// Utilisation dans un composant (observer)
function MyComponent() {
  // ✅ Ce composant "observe" currentUser
  const currentUser = useStore((state) => state.currentUser);
  
  // Quand currentUser change, le composant re-render automatiquement
  return <div>{currentUser?.name}</div>;
}
```

**Pourquoi Observer ?**
- ✅ Réactivité : Les composants re-render automatiquement au changement
- ✅ Découplage : Les composants ne se connaissent pas entre eux
- ✅ État global : Partagé entre tous les composants
- ✅ Synchronisation : Tous les observers voient le même état

**Avantages** :
- Pas de prop drilling
- État synchronisé
- Performance (re-render seulement les observers concernés)

---

### 7. Strategy Pattern

**Définition** : Définir une famille d'algorithmes, encapsuler chacun et les rendre interchangeables.

**Utilisation dans Jirafe** : Vues multiples (Board/List/Calendar)

```typescript
// app/page.tsx

// ✅ STRATEGY : Différentes stratégies d'affichage
export default function HomePage() {
  const viewMode = useStore((state) => state.viewMode);
  const cards = useCards();
  
  // Strategy Pattern : On choisit la stratégie selon viewMode
  return (
    <div>
      {viewMode === 'board' && <BoardView cards={cards} />}
      {viewMode === 'list' && <ListView cards={cards} />}
      {viewMode === 'calendar' && <CalendarView cards={cards} />}
    </div>
  );
}

// Chaque vue est une stratégie différente avec la même interface
interface ViewProps {
  cards: Card[];
}

// Stratégie 1 : Vue Kanban
function BoardView({ cards }: ViewProps) {
  return <div className="flex gap-4">
    {/* Colonnes avec drag & drop */}
  </div>;
}

// Stratégie 2 : Vue Liste
function ListView({ cards }: ViewProps) {
  return <table>
    {/* Table avec tri et filtres */}
  </table>;
}

// Stratégie 3 : Vue Calendrier
function CalendarView({ cards }: ViewProps) {
  return <div className="grid grid-cols-7">
    {/* Calendrier mensuel */}
  </div>;
}
```

**Pourquoi Strategy ?**
- ✅ Extensibilité : Facile d'ajouter une nouvelle vue (ex: Timeline)
- ✅ Open/Closed : Pas besoin de modifier les vues existantes
- ✅ Testabilité : Chaque vue peut être testée indépendamment
- ✅ UX : L'utilisateur choisit sa stratégie préférée

**Principe SOLID appliqué** : **Open/Closed Principle**
- Ouvert à l'extension (nouvelle vue = nouveau composant)
- Fermé à la modification (pas de changement dans les vues existantes)

---

### 8. Chain of Responsibility

**Définition** : Éviter de coupler l'émetteur d'une requête à son récepteur en permettant à plusieurs objets de traiter la requête.

**Utilisation dans Jirafe** : Middleware → API Routes → Database

```typescript
// middleware.ts (1er maillon)
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jirafe-auth-token')?.value;
  
  if (!token) {
    // Interrompt la chaîne
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Passe au maillon suivant
  return NextResponse.next();
}

// ↓ Chaîne continue

// API Route (2ème maillon)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    // Interrompt la chaîne
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Passe au maillon suivant (DB)
  const boards = await query('SELECT * FROM boards WHERE owner_id = $1', [user.id]);
  
  // Retourne la réponse
  return NextResponse.json({ boards: boards.rows });
}
```

**Chaîne de traitement** :
```
Request
  ↓
Middleware (Auth check)
  ↓
API Route (Validation)
  ↓
Database (Query)
  ↓
Response
```

**Pourquoi Chain of Responsibility ?**
- ✅ Séparation : Chaque maillon a une responsabilité unique
- ✅ Extensibilité : Facile d'ajouter un maillon (ex: rate limiting)
- ✅ Debugging : Chaque étape peut être isolée

---

## 🎯 Domain-Driven Design (DDD)

### Qu'est-ce que le DDD ?

**Domain-Driven Design** est une approche de développement logiciel qui met l'accent sur :
1. Le **domaine métier** (business domain)
2. Le **langage ubiquitaire** (ubiquitous language)
3. La **modélisation** du domaine

### Bounded Contexts (Contextes délimités)

Dans Jirafe, nous avons identifié **3 bounded contexts** :

#### 1. Identity & Access Context

**Responsabilité** : Gestion des utilisateurs et authentification

**Entities** :
- `User` : Utilisateur du système

**Services** :
- `AuthService` : Login, signup, logout

**Tables** :
- `users`

```typescript
// Entity : User
type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar: string;
  created_at: string;
};
```

---

#### 2. Workspace & Collaboration Context

**Responsabilité** : Gestion des workspaces et membres

**Aggregate Root** : `Workspace`

**Entities** :
- `Workspace` : Espace de travail
- `WorkspaceMember` : Membre d'un workspace

**Value Objects** :
- `Role` : owner, admin, member

**Tables** :
- `workspaces`
- `workspace_members`

```typescript
// Aggregate Root : Workspace
type Workspace = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  avatar: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// Value Object : Role
type Role = 'owner' | 'admin' | 'member';

// Entity : WorkspaceMember
type WorkspaceMember = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: Role;  // Value Object
  joined_at: string;
};
```

**Règle métier** : Un workspace doit toujours avoir au moins un owner.

---

#### 3. Project Management Context

**Responsabilité** : Gestion des boards, cartes, tâches

**Aggregate Root** : `Board`

**Entities** :
- `Board` : Tableau de projet
- `Column` : Colonne du board
- `Card` : Tâche
- `Subtask` : Sous-tâche
- `Comment` : Commentaire

**Value Objects** :
- `Priority` : low, medium, high
- `Tag` : Étiquette de catégorisation

**Domain Events** :
- `CardCreated`
- `CardMoved`
- `CardAssigned`
- `CommentAdded`

**Tables** :
- `boards`
- `columns`
- `cards`
- `subtasks`
- `comments`
- `tags`
- `card_tags`
- `card_activities`

```typescript
// Aggregate Root : Board
type Board = {
  id: string;
  name: string;
  workspace_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

// Entity : Card
type Card = {
  id: string;
  title: string;
  description: string | null;
  column_id: string;
  assignee_id: string | null;
  priority: Priority;  // Value Object
  due_date: string | null;
  start_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

// Value Object : Priority
type Priority = 'low' | 'medium' | 'high';

// Value Object : Tag
type Tag = {
  id: string;
  name: string;
  color: string;
  board_id: string;
};

// Domain Event : CardMoved
type CardMovedEvent = {
  card_id: string;
  from_column_id: string;
  to_column_id: string;
  user_id: string;
  timestamp: string;
};
```

---

### Entities vs Value Objects

#### Entities (Entités)

**Caractéristiques** :
- Ont une **identité** (ID unique)
- Ont un **cycle de vie**
- Sont **mutables**
- L'égalité est basée sur l'ID

**Exemples dans Jirafe** :
- `User` : Identité unique, peut changer de nom
- `Board` : Identité unique, peut être modifié
- `Card` : Identité unique, peut être déplacée

```typescript
// Entity : User
const user1 = { id: 'uuid-1', name: 'Alice', email: 'alice@example.com' };
const user2 = { id: 'uuid-1', name: 'Alice Updated', email: 'alice@example.com' };

// user1 === user2 ? Non, mais même identité (id === id)
```

---

#### Value Objects (Objets-valeur)

**Caractéristiques** :
- **Pas d'identité** propre
- **Immutables**
- L'égalité est basée sur les **valeurs**
- Peuvent être partagés

**Exemples dans Jirafe** :
- `Priority` : 'low', 'medium', 'high' (pas d'ID)
- `Role` : 'owner', 'admin', 'member'
- `Tag.color` : '#FF0000' (couleur hexadécimale)

```typescript
// Value Object : Priority
const priority1 = 'high';
const priority2 = 'high';

// priority1 === priority2 ? Oui, même valeur

// Si on veut changer la priorité, on REMPLACE
card.priority = 'low';  // Nouvelle valeur, pas de modification

// Value Object complexe : Email
class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email');
    }
  }
  
  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  toString(): string {
    return this.value;
  }
}
```

---

### Aggregates (Agrégats)

**Définition** : Un cluster d'objets traités comme une unité pour les changements de données.

**Aggregate Root** : Point d'entrée unique pour accéder à l'agrégat.

#### Exemple : Aggregate Board

```typescript
// Aggregate Root : Board
type Board = {
  id: string;
  name: string;
  workspace_id: string;
  owner_id: string;
};

// Partie de l'agrégat : Column
type Column = {
  id: string;
  board_id: string;  // Référence au root
  name: string;
  position: number;
};

// Partie de l'agrégat : Card
type Card = {
  id: string;
  column_id: string;  // Référence à Column (partie de l'agrégat)
  title: string;
};
```

**Règles d'accès** :
```typescript
// ✅ BON : Accès via le root
GET /api/boards/:boardId/cards

// ❌ ÉVITÉ : Accès direct sans contexte
GET /api/cards  // Toutes les cartes ? De tous les boards ?

// ✅ BON : Modification via le root
PATCH /api/boards/:boardId/cards/:cardId

// ✅ Règle métier : On ne peut déplacer une carte que dans une colonne du même board
async function moveCard(cardId: string, targetColumnId: string) {
  const card = await getCard(cardId);
  const column = await getColumn(targetColumnId);
  
  // Vérification de cohérence de l'agrégat
  if (card.board_id !== column.board_id) {
    throw new Error('Cannot move card to a column from another board');
  }
  
  await updateCard(cardId, { column_id: targetColumnId });
}
```

**Bénéfices** :
- Cohérence des données garantie
- Règles métier centralisées
- Transaction boundaries claires

---

### Services

**Définition** : Opérations qui ne appartiennent naturellement à aucune Entity ou Value Object.

**Exemples dans Jirafe** :

```typescript
// Domain Service : AuthService
class AuthService {
  async signup(name: string, email: string, password: string): Promise<User> {
    // 1. Vérifier si l'email existe
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error('Email already exists');
    }
    
    // 2. Hasher le mot de passe
    const passwordHash = await hashPassword(password);
    
    // 3. Créer l'utilisateur
    const user = await this.createUser({ name, email, passwordHash });
    
    // 4. Créer le workspace par défaut (Factory Pattern)
    await this.createDefaultWorkspace(user);
    
    return user;
  }
}

// Application Service : BoardService
class BoardService {
  async createBoardWithDefaultColumns(
    name: string,
    workspaceId: string,
    userId: string
  ): Promise<Board> {
    // 1. Vérifier les permissions
    await this.checkWorkspaceAccess(workspaceId, userId);
    
    // 2. Créer le board
    const board = await this.createBoard({ name, workspaceId, userId });
    
    // 3. Créer les colonnes par défaut
    await this.createColumn({ boardId: board.id, name: 'To Do', position: 0 });
    await this.createColumn({ boardId: board.id, name: 'In Progress', position: 1 });
    await this.createColumn({ boardId: board.id, name: 'Done', position: 2 });
    
    return board;
  }
}
```

---

### Ubiquitous Language (Langage ubiquitaire)

**Définition** : Un langage commun partagé entre développeurs et experts métier.

**Dans Jirafe** :

| Terme | Signification | Contexte |
|-------|---------------|----------|
| **Workspace** | Espace de travail collaboratif | Collaboration |
| **Board** | Tableau de projet | Project Management |
| **Column** | Étape du workflow | Project Management |
| **Card** | Tâche ou user story | Project Management |
| **Subtask** | Sous-tâche d'une carte | Project Management |
| **Tag** | Étiquette de catégorisation | Project Management |
| **Assignee** | Personne assignée à une tâche | Project Management |
| **Member** | Membre d'un workspace | Collaboration |
| **Owner** | Propriétaire d'un workspace/board | Collaboration |
| **Activity** | Événement enregistré | Project Management |

**Exemple de conversation métier** :
```
Expert : "On doit pouvoir déplacer une **Card** d'une **Column** à une autre"
Dev : "OK, on implémente le drag & drop pour changer le column_id de la Card"

Expert : "Quand on **assigne** une **Card** à un **Member**, il doit être notifié"
Dev : "OK, on crée un CardAssignedEvent quand assignee_id change"

Expert : "Un **Workspace** doit toujours avoir au moins un **Owner**"
Dev : "OK, on ajoute une validation : cannot delete last owner"
```

**Bénéfice** : Pas de traduction, pas de malentendu entre métier et technique.

---

## 🏛️ Principes SOLID

### 1. Single Responsibility Principle (SRP)

> Une classe/module ne doit avoir qu'une seule raison de changer.

**Exemples** :

```typescript
// ✅ BON : Une responsabilité = Authentification
// lib/auth.ts
export async function hashPassword(password: string) { ... }
export async function verifyPassword(password: string, hash: string) { ... }
export async function generateToken(userId: string) { ... }
export async function verifyToken(token: string) { ... }

// ✅ BON : Une responsabilité = Accès aux données
// lib/database.ts
export async function query(text: string, params?: any[]) { ... }

// ❌ MAUVAIS : Trop de responsabilités
class UserManager {
  createUser() { ... }           // Création
  hashPassword() { ... }          // Sécurité
  sendEmail() { ... }             // Email
  logActivity() { ... }           // Logging
  validateInput() { ... }         // Validation
}
```

---

### 2. Open/Closed Principle (OCP)

> Ouvert à l'extension, fermé à la modification.

**Exemple** : Strategy Pattern pour les vues

```typescript
// ✅ Ajouter une nouvelle vue = Extension (pas de modification)
// Nouveau fichier : components/timeline-view.tsx
export function TimelineView({ cards }: ViewProps) {
  return <div>Timeline implementation</div>;
}

// Dans app/page.tsx, on ajoute juste :
{viewMode === 'timeline' && <TimelineView cards={cards} />}

// Pas besoin de modifier BoardView, ListView, CalendarView !
```

---

### 3. Liskov Substitution Principle (LSP)

> Les sous-types doivent être substituables à leurs types de base.

**Exemple** : Toutes les vues respectent la même interface

```typescript
interface ViewProps {
  cards: Card[];
  onCardClick?: (id: string) => void;
}

// Toutes interchangeables
const views = {
  board: BoardView,
  list: ListView,
  calendar: CalendarView,
};

const ViewComponent = views[viewMode];
<ViewComponent cards={cards} onCardClick={handleClick} />
```

---

### 4. Interface Segregation Principle (ISP)

> Ne pas forcer les clients à dépendre d'interfaces qu'ils n'utilisent pas.

**Exemple** : Types séparés

```typescript
// ✅ Type minimal pour la liste
type CardListItem = {
  id: string;
  title: string;
  assignee_id: string | null;
  priority: Priority;
};

// ✅ Type complet pour les détails
type CardWithDetails = Card & {
  assignee: User | null;
  comments: Comment[];
  subtasks: Subtask[];
  tags: Tag[];
  activities: Activity[];
};

// Les composants simples utilisent CardListItem
// Les composants détaillés utilisent CardWithDetails
```

---

### 5. Dependency Inversion Principle (DIP)

> Dépendre d'abstractions, pas de détails.

**Exemple** : Repository Pattern

```typescript
// ✅ Les API routes dépendent de l'abstraction query()
const boards = await query('SELECT * FROM boards WHERE owner_id = $1', [userId]);

// Pas de dépendance directe à PostgreSQL
// Demain, on peut remplacer query() par un client MongoDB
```

---

## 📐 Architecture en couches

```
┌─────────────────────────────────────────┐
│   PRESENTATION LAYER                    │
│   - Components React                    │
│   - Pages Next.js                       │
│   - Hooks                               │
└──────────────┬──────────────────────────┘
               ↓ HTTP
┌──────────────▼──────────────────────────┐
│   API LAYER                             │
│   - API Routes                          │
│   - Middleware                          │
└──────────────┬──────────────────────────┘
               ↓
┌──────────────▼──────────────────────────┐
│   BUSINESS LOGIC LAYER                  │
│   - Services                            │
│   - Domain Logic                        │
│   - Validation                          │
└──────────────┬──────────────────────────┘
               ↓
┌──────────────▼──────────────────────────┐
│   DATA ACCESS LAYER                     │
│   - Repository (query)                  │
│   - Database Client                     │
└──────────────┬──────────────────────────┘
               ↓ SQL
┌──────────────▼──────────────────────────┐
│   DATABASE                              │
│   - PostgreSQL                          │
│   - Tables, Indexes                     │
└─────────────────────────────────────────┘
```

---

## 🔐 Sécurité

### Security by Design

1. **Authentification** : JWT + bcrypt (10 rounds)
2. **Cookies httpOnly** : Protection XSS
3. **sameSite strict** : Protection CSRF
4. **Validation serveur** : Never trust client
5. **SQL paramétré** : Protection injection SQL
6. **Middleware** : Protection automatique des routes

---

## 📊 Récapitulatif

### Design Patterns implémentés

| Pattern | Type | Utilisation |
|---------|------|-------------|
| **Singleton** | Créationnel | Pool de connexions |
| **Factory** | Créationnel | Création User+Workspace |
| **Repository** | Structurel | Abstraction DB |
| **Proxy** | Structurel | API Routes |
| **Decorator** | Structurel | Hashage password |
| **Observer** | Comportemental | Zustand store |
| **Strategy** | Comportemental | Vues multiples |
| **Chain of Responsibility** | Comportemental | Middleware chain |

### DDD appliqué

- ✅ **3 Bounded Contexts** identifiés
- ✅ **Entities** vs **Value Objects** séparés
- ✅ **Aggregates** avec root défini
- ✅ **Services** pour logique complexe
- ✅ **Ubiquitous Language** cohérent

### Principes SOLID

- ✅ Single Responsibility
- ✅ Open/Closed
- ✅ Liskov Substitution
- ✅ Interface Segregation
- ✅ Dependency Inversion

---

**Version** : 2.0.0  
**Dernière mise à jour** : 01/02/2026

Pour plus de détails techniques, consultez le [MANUEL-DEVELOPPEUR.md](MANUEL-DEVELOPPEUR.md)
