# 🔄 Guide de Reset Complet de la Base de Données

## 🚨 Reset TOTAL (supprime tout et recrée)

### Étape 1 : Arrêter et supprimer le conteneur Docker

```bash
docker-compose down -v
```

> `-v` supprime aussi les volumes (= toutes les données)

### Étape 2 : Redémarrer le conteneur

```bash
docker-compose up -d
```

> Attends 3-4 secondes que PostgreSQL démarre

### Étape 3 : Appliquer le schema complet

```bash
npm run db:migrate
```

### ✅ Vérifier que tout fonctionne

```bash
npm run db:shell
```

Puis dans le shell PostgreSQL :

```sql
-- Voir toutes les tables
\dt

-- Voir les users
SELECT name, email FROM users;

-- Voir les workspaces
SELECT name, avatar FROM workspaces;

-- Voir les membres
SELECT w.name, u.name, wm.role 
FROM workspace_members wm
JOIN workspaces w ON wm.workspace_id = w.id
JOIN users u ON wm.user_id = u.id;

-- Quitter
\q
```

---

## 🧹 Une seule commande (tout-en-un)

```bash
npm run db:reset
```

> ⚠️ **ATTENTION** : Cette commande supprime TOUT et recrée la DB !

---

## 🎯 Ce qui sera créé

- ✅ 4 utilisateurs avec email/password
  - alice@jirafe.local / password123 (Owner)
  - bob@jirafe.local / password123 (Member)
  - carol@jirafe.local / password123 (Member)
  - david@jirafe.local / password123 (Member)

- ✅ 1 workspace "Espace de travail principal"
  - Avec les 4 membres

- ✅ 1 board "Projet Principal"
  - Avec 3 colonnes : À faire, En cours, Terminé

---

## 🐛 En cas de problème

### Docker ne démarre pas

```bash
# Voir les logs
npm run db:logs

# Ou
docker logs jirafe-postgres
```

### Erreur "database already exists"

C'est normal si tu refais `db:migrate` sans supprimer le conteneur.
Utilise `npm run db:reset` à la place.

### Port 5433 déjà utilisé

```bash
# Voir ce qui utilise le port
lsof -i :5433

# Arrêter le conteneur
docker-compose down
```

---

## 📁 Fichiers de migration

- **`init-db.sql`** : Schema complet (utilisé par `npm run db:migrate`)
- **`migrations/`** : Historique des modifications
  - `add_auth_to_users.sql` : Ajout email/password (déjà appliqué)
  - `create_workspaces.sql` : Ajout workspaces (déjà appliqué)

> ℹ️ Les fichiers dans `migrations/` sont pour référence historique.
> Le fichier `init-db.sql` contient déjà tout !

