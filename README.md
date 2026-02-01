# 🦒 Jirafe - Gestionnaire de projets moderne

> Un système de gestion de projets collaboratif et full-stack inspiré de Jira, construit avec Next.js 13, TypeScript et PostgreSQL. Projet d'architecture logicielle démontrant l'application de design patterns et Domain-Driven Design.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Next.js](https://img.shields.io/badge/Next.js-13.5-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

**Dernière mise à jour** : 01/02/2026

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture & Patterns](#-architecture--patterns)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Structure du projet](#-structure-du-projet)
- [Tests](#-tests)
- [Documentation](#-documentation)

---

## 🎯 Vue d'ensemble

**Jirafe** est une application web full-stack de gestion de projets et de tâches, développée dans le cadre d'un cours d'architecture logicielle. Le projet met l'accent sur :

- ✅ **Architecture propre et modulaire** (Clean Architecture)
- ✅ **Design patterns** (Singleton, Repository, Observer, Strategy, etc.)
- ✅ **Sécurité** (JWT, bcrypt, cookies httpOnly, middleware d'authentification)
- ✅ **Performance** (Connection pooling, Server Components, optimisations React)
- ✅ **Scalabilité** (Architecture modulaire, séparation des préoccupations)
- ✅ **Tests** (Tests unitaires et d'intégration avec Jest)
- ✅ **DevOps** (Docker, scripts de migration, CI-ready)

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- ✓ Inscription et connexion sécurisées avec validation
- ✓ Hashage des mots de passe avec **bcrypt** (salt rounds: 10)
- ✓ Tokens **JWT** avec cookies **httpOnly** (protection XSS)
- ✓ Protection automatique des routes via middleware Next.js
- ✓ Gestion de profil utilisateur
- ✓ Déconnexion sécurisée avec invalidation de session

### 📊 Gestion de projets collaborative
- **Workspaces** : Espaces de travail multi-utilisateurs avec gestion de membres
- **Boards** : Tableaux de projet avec permissions
- **Colonnes** : Workflow personnalisable (To Do, In Progress, Done, etc.)
- **Cartes** : Tâches détaillées avec :
  - Description riche
  - Dates de début et d'échéance
  - Niveaux de priorité (Basse, Moyenne, Haute)
  - Assignation à des membres
- **Tags** : Catégorisation avec étiquettes colorées
- **Sous-tâches** : Décomposition hiérarchique des tâches
- **Commentaires** : Discussion en temps réel sur les tâches
- **Activités** : Historique complet et traçable des modifications

### 👁️ Vues multiples (Strategy Pattern)
- **Board View** : Vue Kanban classique avec drag & drop (dnd-kit)
- **List View** : Vue tabulaire pour une vision d'ensemble
- **Calendar View** : Planification temporelle avec dates d'échéance

### 🔍 Recherche et filtres avancés
- 🔎 Recherche par titre de carte
- 👤 Filtrer par utilisateur assigné
- 🏷️ Filtrer par tags multiples
- 📅 Filtrer par dates (échéance, création)

---

## 🏗️ Architecture & Patterns

### Design Patterns implémentés

#### 🏭 Patterns Créationnels
| Pattern | Localisation | Utilité |
|---------|--------------|---------|
| **Singleton** | `lib/database.ts` | Pool de connexions PostgreSQL unique |
| **Factory** | `app/api/auth/signup/route.ts` | Création automatique User + Workspace |

#### 🔨 Patterns Structurels
| Pattern | Localisation | Utilité |
|---------|--------------|---------|
| **Repository** | `lib/database.ts` | Abstraction de l'accès aux données |
| **Proxy** | API Routes | Contrôle d'accès et validation |
| **Decorator** | `lib/auth.ts` | Ajout de hashage aux mots de passe |

#### 🎭 Patterns Comportementaux
| Pattern | Localisation | Utilité |
|---------|--------------|---------|
| **Observer** | `lib/store.ts` (Zustand) | État global réactif |
| **Strategy** | `components/*-view.tsx` | Vues interchangeables (Board/List/Calendar) |
| **Chain of Responsibility** | `middleware.ts` → API Routes | Traitement séquentiel des requêtes |

📖 **[ARCHITECTURE-PATTERNS.md](ARCHITECTURE-PATTERNS.md)** - Analyse détaillée avec exemples de code

### Domain-Driven Design (DDD)

**3 Bounded Contexts identifiés** :

1. **Identity & Access** - Gestion utilisateurs et authentification
2. **Workspace & Collaboration** - Gestion des espaces de travail
3. **Project Management** - Gestion des boards, cartes, tâches

**Concepts DDD appliqués** :
- ✅ **Entities** : User, Workspace, Board, Card
- ✅ **Value Objects** : Priority, Role, Tag
- ✅ **Aggregates** : Board (root), avec Columns et Cards
- ✅ **Services** : AuthService, BoardService
- ✅ **Ubiquitous Language** : Vocabulaire métier cohérent

📖 **[ARCHITECTURE-PATTERNS.md](ARCHITECTURE-PATTERNS.md)** - Section DDD complète

### Principes SOLID appliqués
- ✅ **S**ingle Responsibility : Chaque module a une responsabilité unique
- ✅ **O**pen/Closed : Ouvert à l'extension, fermé à la modification
- ✅ **L**iskov Substitution : Les vues sont interchangeables
- ✅ **I**nterface Segregation : Types spécialisés selon les besoins
- ✅ **D**ependency Inversion : Dépendre d'abstractions (Repository)

📖 **[ARCHITECTURE-PATTERNS.md](ARCHITECTURE-PATTERNS.md)** - Section SOLID avec exemples

---

## 🛠️ Technologies

### Frontend
- **Next.js 13.5** - Framework React avec App Router et Server Components
- **React 18.2** - Bibliothèque UI avec hooks modernes
- **TypeScript 5.2** - Typage statique fort
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI accessibles et personnalisables
- **@dnd-kit** - Bibliothèque drag & drop performante
- **Zustand** - State management léger et réactif
- **date-fns** - Manipulation de dates moderne

### Backend
- **Next.js API Routes** - API REST serverless
- **PostgreSQL 16** - Base de données relationnelle robuste
- **node-postgres (pg)** - Driver PostgreSQL natif
- **bcryptjs** - Hashage sécurisé des mots de passe
- **jose** - Gestion JWT moderne et sécurisée

### DevOps & Outils
- **Docker** - Containerisation de PostgreSQL
- **Docker Compose** - Orchestration multi-conteneurs
- **Jest** - Framework de tests unitaires et d'intégration
- **Testing Library** - Tests orientés utilisateur
- **ESLint** - Linting et analyse statique
- **TypeScript Compiler** - Vérification de types

---

## 🚀 Installation

### Prérequis
- **Node.js** 18.x ou supérieur
- **Docker** & Docker Compose
- **npm** ou **yarn**

### Installation complète

```bash
# 1. Cloner le repository
git clone <url-du-repo>
cd jirafe

# 2. Installer les dépendances
npm install

# 3. Démarrer PostgreSQL avec Docker
npm run db:start

# 4. Initialiser le schéma de base de données
npm run db:migrate

# 5. Créer les utilisateurs de test
node scripts/create-test-users.js

# 6. Lancer l'application en développement
npm run dev
```

L'application est maintenant accessible sur **http://localhost:3000** 🎉

### 🔑 Comptes de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `alice@jirafe.local` | `password123` | Admin |
| `bob@jirafe.local` | `password123` | Membre |
| `carol@jirafe.local` | `password123` | Membre |
| `david@jirafe.local` | `password123` | Membre |

### Variables d'environnement (optionnel)

Créer un fichier `.env.local` à la racine :

```env
# Base de données
PGHOST=localhost
PGPORT=5433
PGDATABASE=jirafe_db
PGUSER=jirafe
PGPASSWORD=jirafe_dev_2024

# Authentification
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## 📁 Structure du projet

```
jirafe/
├── app/                          # Application Next.js 13+ (App Router)
│   ├── api/                      # API Routes (Backend REST)
│   │   ├── auth/                 # Endpoints d'authentification
│   │   │   ├── login/            # POST /api/auth/login
│   │   │   ├── signup/           # POST /api/auth/signup
│   │   │   ├── logout/           # POST /api/auth/logout
│   │   │   ├── me/               # GET /api/auth/me
│   │   │   └── profile/          # PUT /api/auth/profile
│   │   ├── workspaces/           # CRUD workspaces
│   │   ├── boards/               # CRUD boards
│   │   ├── cards/                # CRUD cartes + détails
│   │   ├── columns/              # CRUD colonnes
│   │   ├── tags/                 # CRUD tags
│   │   ├── comments/             # CRUD commentaires
│   │   ├── subtasks/             # CRUD sous-tâches
│   │   └── activities/           # Historique d'activités
│   ├── login/                    # Page de connexion
│   ├── signup/                   # Page d'inscription
│   ├── profile/                  # Gestion du profil utilisateur
│   ├── workspace/                # Pages workspaces
│   │   ├── [id]/                 # Détails d'un workspace
│   │   │   └── settings/         # Paramètres workspace
│   │   └── new/                  # Créer un workspace
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Page d'accueil (boards)
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants React réutilisables
│   ├── ui/                       # Composants UI de base (shadcn)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── board-view.tsx            # Vue Kanban avec drag & drop
│   ├── list-view.tsx             # Vue liste tabulaire
│   ├── calendar-view.tsx         # Vue calendrier
│   ├── card-detail-modal.tsx     # Modal de détails de carte
│   ├── board-selector.tsx        # Sélecteur de board
│   ├── workspace-selector.tsx    # Sélecteur de workspace
│   └── search-filters.tsx        # Barre de recherche et filtres
│
├── lib/                          # Logique métier et utilitaires
│   ├── auth.ts                   # JWT, hashage, vérification tokens
│   ├── database.ts               # Pool PostgreSQL, requêtes, types
│   ├── store.ts                  # Store Zustand (état global)
│   ├── types.ts                  # Types TypeScript partagés
│   └── utils.ts                  # Helpers (classnames, dates, etc.)
│
├── hooks/                        # Custom React Hooks
│   └── use-toast.ts              # Hook pour notifications toast
│
├── __tests__/                    # Tests Jest
│   ├── lib/                      # Tests unitaires
│   │   └── auth.test.ts
│   └── api/                      # Tests d'intégration API
│       ├── auth/
│       ├── boards/
│       └── cards/
│
├── __mocks__/                    # Mocks pour tests
│   ├── jose.ts                   # Mock JWT
│   ├── pg.ts                     # Mock PostgreSQL
│   └── next/
│
├── migrations/                   # Migrations SQL
│   ├── create_workspaces.sql
│   └── add_auth_to_users.sql
│
├── scripts/                      # Scripts utilitaires
│   ├── create-test-users.js      # Créer des utilisateurs de test
│   └── migrate.js                # Script de migration
│
├── middleware.ts                 # Middleware Next.js (auth globale)
├── docker-compose.yml            # Configuration PostgreSQL
├── init-db.sql                   # Schéma initial de la DB
├── jest.config.js                # Configuration Jest
├── tsconfig.json                 # Configuration TypeScript
├── tailwind.config.ts            # Configuration Tailwind
└── next.config.js                # Configuration Next.js
```

---

## 🧪 Tests

Le projet inclut une suite de tests complète :

```bash
# Exécuter tous les tests
npm test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration API
npm run test:api

# Mode watch (développement)
npm run test:watch

# Couverture de code
npm run test:coverage
```

### Couverture des tests
- ✅ Authentification (signup, login, JWT)
- ✅ API Routes (boards, cards, workspaces)
- ✅ Fonctions de hashage et validation
- ✅ Middleware de protection des routes

---

## 📚 Documentation

### 📖 Documentation organisée en 4 manuels

#### 📘 **[MANUEL-UTILISATEUR.md](MANUEL-UTILISATEUR.md)**
Guide complet pour les utilisateurs finaux : installation, utilisation, fonctionnalités.

#### 👨‍💻 **[MANUEL-DEVELOPPEUR.md](MANUEL-DEVELOPPEUR.md)**  
Guide technique pour les développeurs : architecture, API, base de données, contribution.

#### 🏛️ **[ARCHITECTURE-PATTERNS.md](ARCHITECTURE-PATTERNS.md)**
Analyse approfondie des design patterns, DDD (Domain-Driven Design), principes SOLID.

#### 🔄 **[CHANGELOG.md](CHANGELOG.md)**
Historique des versions et modifications.

---

## 📝 Commandes NPM disponibles

### Développement
```bash
npm run dev          # Démarrer le serveur de développement (port 3000)
npm run build        # Build de production
npm start            # Démarrer le serveur de production
npm run lint         # Linter ESLint
npm run typecheck    # Vérifier les types TypeScript
```

### Base de données
```bash
npm run db:start     # Démarrer PostgreSQL (Docker)
npm run db:stop      # Arrêter PostgreSQL
npm run db:migrate   # Exécuter les migrations
npm run db:reset     # Réinitialiser la DB (⚠️ supprime les données)
npm run db:shell     # Ouvrir un shell PostgreSQL
npm run db:logs      # Afficher les logs PostgreSQL
```

### Tests
```bash
npm test             # Tous les tests
npm run test:unit    # Tests unitaires
npm run test:api     # Tests d'intégration
npm run test:watch   # Mode watch
npm run test:coverage # Rapport de couverture
```

---

## 🎓 Objectifs pédagogiques

Ce projet démontre la maîtrise de :

1. **Architecture logicielle moderne**
   - Séparation frontend/backend
   - Architecture en couches (présentation, logique, données)
   - Modularité et réutilisabilité

2. **Design Patterns avancés**
   - Patterns créationnels (Singleton, Factory)
   - Patterns structurels (Decorator, Proxy)
   - Patterns comportementaux (Observer, Strategy, Chain of Responsibility)

3. **Bonnes pratiques de développement**
   - Clean Code et conventions de nommage
   - Principes SOLID
   - Tests automatisés (TDD-friendly)
   - Documentation complète
   - Gestion de versions (Git)

4. **Sécurité applicative**
   - Authentification robuste (JWT + bcrypt)
   - Protection CSRF et XSS
   - Validation des entrées
   - Gestion sécurisée des secrets

5. **DevOps et déploiement**
   - Containerisation avec Docker
   - Scripts de migration et d'initialisation
   - Configuration par environnement
   - Logs et monitoring

---

## � License

MIT License - Libre d'utilisation pour des projets éducatifs.

---

## 👥 Auteur

Projet d'architecture logicielle - 2026

---