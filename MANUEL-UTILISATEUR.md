# 📘 Manuel Utilisateur - Jirafe

**Version** : 2.0.0  
**Dernière mise à jour** : 01/02/2026

---

## 📋 Table des matières

1. [Introduction](#-introduction)
2. [Installation](#-installation)
3. [Premiers pas](#-premiers-pas)
4. [Fonctionnalités](#-fonctionnalités)
5. [Utilisation avancée](#-utilisation-avancée)
6. [Dépannage](#-dépannage)

---

## 🎯 Introduction

**Jirafe** est un gestionnaire de projets moderne inspiré de Jira, permettant de gérer des tâches, des boards et de collaborer en équipe.

### Concepts clés

- **Workspace** : Espace de travail partagé avec votre équipe
- **Board** : Tableau de projet contenant vos tâches
- **Column** : Étape du workflow (To Do, In Progress, Done)
- **Card** : Tâche ou user story
- **Tag** : Étiquette pour catégoriser les cartes

---

## 🚀 Installation

### Prérequis

- **Node.js 18+** ([télécharger](https://nodejs.org/))
- **Docker Desktop** ([télécharger](https://www.docker.com/products/docker-desktop/))

### Installation en 5 étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer PostgreSQL avec Docker
npm run db:start

# 3. Initialiser la base de données
npm run db:migrate

# 4. Créer les utilisateurs de test
node scripts/create-test-users.js

# 5. Lancer l'application
npm run dev
```

L'application est accessible sur **http://localhost:3000** 🎉

### Comptes de test

| Email | Mot de passe |
|-------|--------------|
| `alice@jirafe.local` | `password123` |
| `bob@jirafe.local` | `password123` |
| `carol@jirafe.local` | `password123` |
| `david@jirafe.local` | `password123` |

---

## 🎮 Premiers pas

### 1. Connexion

1. Ouvrir http://localhost:3000
2. Vous êtes redirigé vers `/login`
3. Utiliser un compte de test (ex: `alice@jirafe.local` / `password123`)

### 2. Créer votre premier board

1. Cliquer sur **"Nouveau board"** ou le bouton **+**
2. Entrer le nom du board (ex: "Mon projet")
3. Le board est créé avec 3 colonnes par défaut :
   - **To Do** : Tâches à faire
   - **In Progress** : Tâches en cours
   - **Done** : Tâches terminées

### 3. Ajouter une carte (tâche)

1. Dans une colonne, cliquer sur **"Ajouter une carte"**
2. Remplir :
   - **Titre** : Nom de la tâche
   - **Description** : Détails (optionnel)
   - **Priorité** : Basse, Moyenne, Haute
   - **Assigné à** : Membre de l'équipe
   - **Date d'échéance** : Date limite
3. Cliquer sur **"Créer"**

### 4. Déplacer une carte

**Drag & Drop** :
1. Cliquer et maintenir sur une carte
2. Glisser vers une autre colonne
3. Relâcher pour déposer

---

## ✨ Fonctionnalités

### Gestion des workspaces

#### Créer un workspace
1. Menu utilisateur → **"Workspaces"**
2. Cliquer sur **"Nouveau workspace"**
3. Entrer le nom et la description
4. Cliquer sur **"Créer"**

#### Inviter des membres
1. Ouvrir un workspace
2. Aller dans **"Paramètres"** → **"Membres"**
3. Cliquer sur **"Inviter"**
4. Entrer l'email du membre
5. Choisir le rôle :
   - **Owner** : Tous les droits
   - **Admin** : Gérer membres et boards
   - **Member** : Éditer les cartes

### Gestion des boards

#### Créer un board
1. Dans un workspace, cliquer sur **"Nouveau board"**
2. Entrer le nom du board
3. Le board est créé avec les colonnes par défaut

#### Personnaliser les colonnes
1. Ouvrir un board
2. Menu colonne (⋮) → **"Modifier"**
3. Changer le nom
4. Ou **"Supprimer"** pour enlever la colonne
5. Cliquer sur **"+ Ajouter une colonne"** pour en créer

### Gestion des cartes

#### Créer une carte détaillée
1. Cliquer sur **"Ajouter une carte"**
2. Remplir les informations :
   ```
   Titre : Implémenter la fonctionnalité X
   Description : Cette tâche consiste à...
   Priorité : Haute
   Assigné à : Alice
   Date de début : 01/02/2026
   Date d'échéance : 10/02/2026
   ```
3. Cliquer sur **"Créer"**

#### Ajouter des tags
1. Ouvrir une carte
2. Section **"Tags"** → **"+"**
3. Créer un nouveau tag ou choisir existant
4. Exemple de tags : `frontend`, `backend`, `bug`, `feature`

#### Ajouter des sous-tâches
1. Ouvrir une carte
2. Section **"Sous-tâches"** → **"Ajouter"**
3. Entrer le titre de la sous-tâche
4. Cocher pour marquer comme complétée

#### Commenter une carte
1. Ouvrir une carte
2. Section **"Commentaires"** en bas
3. Écrire votre commentaire
4. Cliquer sur **"Envoyer"**
5. Les autres membres verront le commentaire

### Historique des activités

Chaque modification est enregistrée :
- Création/suppression de carte
- Changement de colonne
- Modification de champs
- Ajout de commentaire

**Voir l'historique** :
1. Ouvrir une carte
2. Onglet **"Activité"**
3. Liste chronologique des changements

### Vues multiples

Jirafe propose 3 façons de visualiser vos tâches :

#### 🎯 Vue Board (Kanban)
- Vue par défaut
- Colonnes avec cartes
- Drag & drop activé
- Idéal pour le workflow

**Activer** : Cliquer sur l'icône grille en haut

#### 📋 Vue Liste
- Vue tabulaire
- Toutes les cartes en une liste
- Tri et filtres
- Idéal pour les rapports

**Activer** : Cliquer sur l'icône liste en haut

#### 📅 Vue Calendrier
- Vue temporelle
- Cartes organisées par date d'échéance
- Navigation mensuelle
- Idéal pour la planification

**Activer** : Cliquer sur l'icône calendrier en haut

### Recherche et filtres

#### Rechercher une carte
1. Barre de recherche en haut
2. Taper le titre de la carte
3. Résultats en temps réel

#### Filtrer les cartes

**Par assignation** :
- Menu filtre → **"Assigné à"**
- Choisir un ou plusieurs membres
- Seules les cartes assignées s'affichent

**Par tags** :
- Menu filtre → **"Tags"**
- Cocher les tags voulus
- Affiche les cartes avec ces tags

**Par date** :
- Menu filtre → **"Date d'échéance"**
- Choisir une plage de dates
- Affiche les cartes dans cette période

**Combiner les filtres** :
- Vous pouvez utiliser plusieurs filtres en même temps
- Exemple : Cartes assignées à Alice avec tag "urgent"

---

## 🔧 Utilisation avancée

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `N` | Nouvelle carte |
| `B` | Nouveau board |
| `/` | Recherche |
| `Esc` | Fermer modal |
| `?` | Aide |

### Gestion du profil

1. Menu utilisateur (en haut à droite)
2. **"Profil"**
3. Modifier :
   - Nom d'affichage
   - Avatar (emoji)
   - Email
   - Mot de passe

### Notifications

Les actions suivantes génèrent des notifications :
- Assignation d'une carte
- Commentaire sur une carte où vous êtes assigné
- Mention dans un commentaire (@username)

### Thèmes et préférences

1. Menu utilisateur → **"Préférences"**
2. Choisir :
   - Thème (clair/sombre)
   - Vue par défaut (board/liste/calendrier)
   - Langue

---

## 🐛 Dépannage

### Je ne peux pas me connecter

**Problème** : "Invalid credentials"

**Solutions** :
1. Vérifier l'email et le mot de passe
2. Utiliser un compte de test : `alice@jirafe.local` / `password123`
3. Recréer les utilisateurs : `node scripts/create-test-users.js`

### La base de données ne fonctionne pas

**Problème** : "Error: connect ECONNREFUSED"

**Solutions** :
```bash
# Vérifier si Docker est lancé
docker ps

# Relancer PostgreSQL
npm run db:stop
npm run db:start

# Attendre 5 secondes puis
npm run db:migrate
```

### Les cartes ne s'affichent pas

**Solutions** :
1. Rafraîchir la page (F5)
2. Vider le cache du navigateur
3. Vérifier la console (F12) pour les erreurs
4. Vérifier que le serveur est lancé (`npm run dev`)

### Réinitialiser complètement

**⚠️ Cela supprime toutes les données !**

```bash
npm run db:reset
```

Cette commande :
1. Supprime le conteneur PostgreSQL
2. Recrée la base de données
3. Réexécute les migrations
4. Recrée les utilisateurs de test

---

## 📞 Support et aide

### Commandes utiles

```bash
# Développement
npm run dev              # Lancer l'app
npm run build            # Build production
npm run typecheck        # Vérifier TypeScript

# Base de données
npm run db:start         # Démarrer PostgreSQL
npm run db:stop          # Arrêter PostgreSQL
npm run db:shell         # Shell PostgreSQL
npm run db:logs          # Voir les logs
npm run db:reset         # Réinitialiser (⚠️)

# Tests
npm test                 # Tous les tests
npm run test:watch       # Mode watch
```

### Ressources

- **Documentation développeur** : [MANUEL-DEVELOPPEUR.md](MANUEL-DEVELOPPEUR.md)
- **Architecture** : [ARCHITECTURE-PATTERNS.md](ARCHITECTURE-PATTERNS.md)
- **README principal** : [README.md](README.md)

---

## 📝 Astuces et bonnes pratiques

### Organisation des boards

1. **Un board par projet** : Ne pas tout mélanger
2. **Noms explicites** : "Site Web Client X" plutôt que "Projet 1"
3. **Archiver les anciens boards** : Garder seulement les actifs

### Organisation des colonnes

**Workflow simple** :
- To Do → In Progress → Done

**Workflow avancé** :
- Backlog → To Do → In Progress → Review → Testing → Done

**Workflow Scrum** :
- Product Backlog → Sprint Backlog → In Progress → Review → Done

### Rédaction des cartes

**Bon titre** :
✅ "Implémenter l'authentification JWT"
❌ "Auth"

**Bonne description** :
```markdown
## Objectif
Implémenter un système d'authentification JWT

## Critères d'acceptation
- [ ] Les utilisateurs peuvent se connecter
- [ ] Les tokens expirent après 7 jours
- [ ] Les routes protégées nécessitent un token

## Ressources
- Documentation JWT : https://...
```

### Utilisation des tags

**Catégories recommandées** :
- **Type** : `feature`, `bug`, `improvement`
- **Priorité** : `urgent`, `important`, `low`
- **Domaine** : `frontend`, `backend`, `database`, `design`
- **Status** : `blocked`, `waiting`, `ready`

### Communication

**Dans les commentaires** :
- Mentionner avec @username
- Être concis et clair
- Ajouter des captures d'écran si nécessaire
- Éviter les doublons (relire avant de poster)

---

**Bon travail avec Jirafe ! 🦒**

Pour toute question technique, consultez le [MANUEL-DEVELOPPEUR.md](MANUEL-DEVELOPPEUR.md)
