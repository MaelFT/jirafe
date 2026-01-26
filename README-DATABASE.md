# 🗄️ Configuration Base de Données - Jirafe

Ce projet utilise **PostgreSQL** en local avec Docker.

## 🚀 Démarrage rapide

### 1. Démarrer PostgreSQL
```bash
npm run db:start
```

Cette commande démarre un conteneur Docker PostgreSQL en arrière-plan.

### 2. Exécuter les migrations
```bash
npm run db:migrate
```

Cela créé toutes les tables et insère les données de test.

### 3. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## 📋 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run db:start` | Démarre PostgreSQL avec Docker |
| `npm run db:stop` | Arrête PostgreSQL |
| `npm run db:migrate` | Exécute les migrations SQL |
| `npm run db:reset` | Reset complet : supprime tout et recrée la DB |

## 🔧 Configuration

### Variables d'environnement

Le fichier `.env.local` contient la connection string :

```env
DATABASE_URL=postgres://jirafe:jirafe_dev_2024@localhost:5432/jirafe_db
```

**Credentials par défaut** (développement uniquement) :
- **User:** jirafe
- **Password:** jirafe_dev_2024
- **Database:** jirafe_db
- **Port:** 5433 (⚠️ Pas 5432 pour éviter conflit avec PostgreSQL local)

### Accès direct à PostgreSQL

Si tu veux te connecter directement à la base :

```bash
# Avec psql depuis Docker
docker exec -it jirafe-postgres psql -U jirafe -d jirafe_db

# Ou avec npm
npm run db:shell

# Ou avec un client externe (TablePlus, DBeaver, etc.)
Host: localhost
Port: 5433  ⚠️ ATTENTION au port !
Database: jirafe_db
User: jirafe
Password: jirafe_dev_2024
```

## 🏗️ Structure de la base

Tables créées :
- `users` - Utilisateurs
- `boards` - Tableaux Kanban
- `columns` - Colonnes des tableaux
- `cards` - Cartes/tâches
- `comments` - Commentaires sur les cartes
- `tags` - Tags/labels
- `card_tags` - Association cartes ↔ tags
- `subtasks` - Sous-tâches
- `card_activities` - Historique des modifications

## 🏗️ Architecture

L'application utilise PostgreSQL avec :

1. ✅ Client `pg` pour Node.js
2. ✅ Fichier `lib/database.ts` pour la connexion
3. ✅ Types TypeScript centralisés dans `lib/types.ts`
4. ✅ Setup Docker avec `docker-compose.yml`
5. ✅ Scripts npm pour gérer la DB facilement

## ⚠️ Troubleshooting

### Erreur "Connection refused"
→ La DB n'est pas démarrée. Lance `npm run db:start`

### Erreur "Database does not exist"
→ Lance `npm run db:migrate`

### Erreur "Port 5432 already in use"
→ Tu as déjà PostgreSQL qui tourne. Arrête-le ou change le port dans `docker-compose.yml`

### Reset complet
Si tout est cassé, reset complet :
```bash
npm run db:reset
```

## 📝 Notes

- Les données sont persistées dans un volume Docker nommé `postgres_data`
- Pour tout supprimer (y compris les données) : `docker-compose down -v`
- En production, change les credentials et utilise une vraie connection string sécurisée

