# 🚀 Guide de démarrage rapide - Jirafe

## Prérequis

- Node.js 18+ installé
- Docker installé et en cours d'exécution

## Installation en 5 étapes

### 1️⃣ Installer les dépendances

```bash
npm install
```

### 2️⃣ Démarrer PostgreSQL

```bash
npm run db:start
```

Cela lance un conteneur Docker PostgreSQL sur le port 5433.

### 3️⃣ Initialiser la base de données

```bash
npm run db:migrate
```

Cela crée toutes les tables et les données initiales.

### 4️⃣ Créer les utilisateurs de test

```bash
node scripts/create-test-users.js
```

Cela crée 4 comptes avec des mots de passe hashés.

### 5️⃣ Lancer l'application

```bash
npm run dev
```

L'app est maintenant accessible sur **http://localhost:3000** 🎉

## 🔑 Se connecter

Tu seras automatiquement redirigé vers `/login`.

Utilise un de ces comptes :

| Email | Mot de passe |
|-------|--------------|
| `alice@jirafe.local` | `password123` |
| `bob@jirafe.local` | `password123` |
| `carol@jirafe.local` | `password123` |
| `david@jirafe.local` | `password123` |

## 📋 Commandes utiles

### Base de données

```bash
# Démarrer PostgreSQL
npm run db:start

# Arrêter PostgreSQL
npm run db:stop

# Réinitialiser la DB (⚠️ supprime toutes les données)
npm run db:reset

# Ouvrir un shell PostgreSQL
npm run db:shell

# Voir les logs PostgreSQL
npm run db:logs
```

### Développement

```bash
# Lancer l'app en mode dev
npm run dev

# Build pour production
npm run build

# Lancer en production
npm start

# Vérifier les types TypeScript
npm run typecheck

# Linter
npm run lint
```

## 🗂️ Structure du projet

```
jirafe/
├── app/                      # Pages Next.js
│   ├── api/                 # API Routes
│   │   ├── auth/           # Authentification
│   │   ├── boards/         # Gestion des boards
│   │   ├── cards/          # Gestion des cartes
│   │   └── ...
│   ├── login/              # Page de connexion
│   ├── signup/             # Page d'inscription
│   └── page.tsx            # Page principale
├── components/              # Composants React
│   ├── ui/                 # Composants UI réutilisables
│   ├── board-view.tsx      # Vue tableau
│   ├── list-view.tsx       # Vue liste
│   └── ...
├── lib/                     # Utilitaires
│   ├── auth.ts             # Authentification
│   ├── database.ts         # Client PostgreSQL
│   ├── store.ts            # State management
│   └── utils.ts            # Helpers
├── migrations/              # Migrations SQL
├── scripts/                 # Scripts utilitaires
├── docker-compose.yml       # Config Docker
└── init-db-simple.sql      # Schéma initial de la DB
```

## 🔧 Configuration

### Variables d'environnement

Le fichier `.env.local` contient :

```env
# PostgreSQL
PGHOST=localhost
PGPORT=5433
PGDATABASE=jirafe_db
PGUSER=jirafe
PGPASSWORD=jirafe_dev_2024

# JWT Secret (à changer en production !)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
```

### Port PostgreSQL

Par défaut, PostgreSQL tourne sur le port **5433** pour éviter les conflits avec une installation locale sur le port 5432.

Si tu veux changer le port, modifie :
- `docker-compose.yml` (section `ports`)
- `.env.local` (variable `PGPORT`)

## 🎨 Fonctionnalités

### Authentification
- ✅ Inscription / Connexion
- ✅ Déconnexion
- ✅ Protection automatique des routes
- ✅ Cookies sécurisés (httpOnly)

### Gestion de projets
- ✅ Créer des boards (tableaux)
- ✅ Colonnes personnalisables
- ✅ Cartes avec détails complets
- ✅ Tags colorés
- ✅ Sous-tâches
- ✅ Commentaires
- ✅ Historique d'activités
- ✅ Assignation d'utilisateurs

### Vues
- ✅ Vue Board (Kanban)
- ✅ Vue Liste
- ✅ Vue Calendrier

### Recherche et filtres
- ✅ Recherche par titre
- ✅ Filtrer par assigné
- ✅ Filtrer par tags
- ✅ Filtrer par dates

## 🐛 Dépannage

### L'app ne démarre pas

```bash
# Vérifier que PostgreSQL tourne
docker ps | grep jirafe-postgres

# Si non, le démarrer
npm run db:start
```

### Erreur de connexion à la DB

```bash
# Vérifier les logs PostgreSQL
npm run db:logs

# Réinitialiser complètement
npm run db:reset
```

### Port 5433 déjà utilisé

```bash
# Trouver le processus
lsof -i :5433

# Arrêter PostgreSQL
npm run db:stop

# Ou changer le port dans docker-compose.yml et .env.local
```

### Erreur JWT / Authentification

1. Vérifier que `JWT_SECRET` est défini dans `.env.local`
2. Vider les cookies du navigateur
3. Redémarrer l'app (`npm run dev`)

## 📚 Documentation

- [README-AUTH.md](./README-AUTH.md) - Documentation complète de l'authentification
- [README-DATABASE.md](./README-DATABASE.md) - Documentation de la base de données
- [CHANGELOG.md](./CHANGELOG.md) - Historique des changements

## 🆘 Besoin d'aide ?

1. Vérifier les logs de l'app dans le terminal
2. Vérifier les logs PostgreSQL : `npm run db:logs`
3. Ouvrir un shell PostgreSQL : `npm run db:shell`
4. Consulter la documentation dans les fichiers README-*.md

---

**Bon développement ! 🎉**


