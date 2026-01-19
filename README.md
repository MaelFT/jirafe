# 🦒 Jirafe - Gestionnaire de projets moderne

> Un système de gestion de projets inspiré de Jira, construit avec Next.js 14, TypeScript et PostgreSQL.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription et connexion sécurisées
- Hashage des mots de passe avec bcrypt
- Tokens JWT avec cookies httpOnly
- Protection automatique des routes
- Menu utilisateur avec déconnexion

### 📊 Gestion de projets
- **Boards** : Créer et gérer plusieurs tableaux de projet
- **Colonnes** : Personnaliser les étapes de votre workflow
- **Cartes** : Tâches détaillées avec description, dates, priorités
- **Tags** : Organiser avec des étiquettes colorées
- **Sous-tâches** : Décomposer les tâches complexes
- **Commentaires** : Collaborer avec votre équipe
- **Activités** : Historique complet des modifications

### 👁️ Vues multiples
- **Board** : Vue Kanban classique avec drag & drop
- **Liste** : Vue tabulaire pour une vision d'ensemble
- **Calendrier** : Planifier avec les dates d'échéance

### 🔍 Recherche et filtres
- Recherche par titre de carte
- Filtrer par utilisateur assigné
- Filtrer par tags
- Filtrer par dates (échéance)

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Docker

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer PostgreSQL
npm run db:start

# 3. Initialiser la base de données
npm run db:migrate

# 4. Créer les utilisateurs de test
node scripts/create-test-users.js

# 5. Lancer l'application
npm run dev
```

L'app est maintenant sur **http://localhost:3000** 🎉

### 🔑 Comptes de test

| Email | Mot de passe |
|-------|--------------|
| `alice@jirafe.local` | `password123` |
| `bob@jirafe.local` | `password123` |
| `carol@jirafe.local` | `password123` |
| `david@jirafe.local` | `password123` |

## 🛠️ Technologies

- **Frontend** : Next.js 14, React, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui
- **Base de données** : PostgreSQL 16
- **Authentification** : JWT, bcryptjs
- **State Management** : Zustand
- **Containerisation** : Docker

## 📁 Structure du projet

```
jirafe/
├── app/                    # Pages et API Routes Next.js
│   ├── api/               # API Routes
│   │   ├── auth/         # Authentification
│   │   ├── boards/       # Gestion des boards
│   │   ├── cards/        # Gestion des cartes
│   │   └── ...
│   ├── login/            # Page de connexion
│   ├── signup/           # Page d'inscription
│   └── page.tsx          # Page principale
├── components/            # Composants React
│   ├── ui/               # Composants UI (shadcn)
│   ├── board-view.tsx    # Vue tableau Kanban
│   ├── list-view.tsx     # Vue liste
│   └── ...
├── lib/                   # Utilitaires
│   ├── auth.ts           # Authentification
│   ├── database.ts       # Client PostgreSQL
│   ├── store.ts          # State management
│   └── utils.ts          # Helpers
├── migrations/            # Migrations SQL
├── scripts/               # Scripts utilitaires
└── docker-compose.yml     # Configuration Docker
```

## 📚 Documentation

- [📖 QUICKSTART.md](./QUICKSTART.md) - Guide de démarrage rapide
- [🔐 README-AUTH.md](./README-AUTH.md) - Système d'authentification
- [💾 README-DATABASE.md](./README-DATABASE.md) - Base de données PostgreSQL
- [📝 CHANGELOG.md](./CHANGELOG.md) - Historique des versions

## 🎯 Commandes utiles

### Base de données

```bash
npm run db:start      # Démarrer PostgreSQL
npm run db:stop       # Arrêter PostgreSQL
npm run db:migrate    # Exécuter les migrations
npm run db:reset      # Réinitialiser la DB
npm run db:shell      # Ouvrir un shell PostgreSQL
npm run db:logs       # Voir les logs
```

### Développement

```bash
npm run dev           # Mode développement
npm run build         # Build production
npm start             # Lancer en production
npm run typecheck     # Vérifier les types
npm run lint          # Linter
```

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ Tokens JWT signés et vérifiés
- ✅ Cookies httpOnly (protection XSS)
- ✅ Cookies secure en production (HTTPS)
- ✅ Validation des entrées côté serveur
- ✅ Protection automatique des routes
- ✅ Emails uniques

## 🐛 Dépannage

### L'app ne démarre pas
```bash
docker ps | grep jirafe-postgres  # Vérifier PostgreSQL
npm run db:start                   # Démarrer si nécessaire
```

### Erreur de connexion à la DB
```bash
npm run db:logs    # Voir les logs
npm run db:reset   # Réinitialiser
```

### Problème d'authentification
1. Vérifier `.env.local` (JWT_SECRET)
2. Vider les cookies du navigateur
3. Redémarrer l'app

## 🗺️ Roadmap

### Version actuelle (2.0.0)
- ✅ Authentification complète
- ✅ Gestion de boards et cartes
- ✅ Vues multiples
- ✅ Recherche et filtres

### Prochaines fonctionnalités
- [ ] Récupération de mot de passe
- [ ] Vérification d'email
- [ ] Page de profil utilisateur
- [ ] Notifications en temps réel
- [ ] Export de données
- [ ] Mode sombre/clair
- [ ] Drag & drop des cartes
- [ ] Pièces jointes
- [ ] Mentions dans les commentaires
- [ ] API publique

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésite pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit tes changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

Développé avec ❤️ pour la gestion de projets moderne.

---

**Version** : 2.0.0  
**Dernière mise à jour** : 17 décembre 2024
