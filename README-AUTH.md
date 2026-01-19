# 🔐 Système d'Authentification Jirafe

## Vue d'ensemble

Jirafe utilise maintenant un système d'authentification complet avec JWT (JSON Web Tokens) et bcrypt pour le hashage des mots de passe.

## 🚀 Démarrage rapide

### 1. Configurer la base de données

Les colonnes `email` et `password_hash` ont été ajoutées à la table `users`.

### 2. Variables d'environnement

Ajouter dans `.env.local` :

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
```

⚠️ **Important** : Changer cette clé en production !

### 3. Comptes de test

4 comptes de test sont disponibles :

| Email | Mot de passe | Utilisateur |
|-------|--------------|-------------|
| `alice@jirafe.local` | `password123` | Alice Johnson 👩‍💼 |
| `bob@jirafe.local` | `password123` | Bob Smith 👨‍💻 |
| `carol@jirafe.local` | `password123` | Carol White 👩‍🎨 |
| `david@jirafe.local` | `password123` | David Brown 👨‍🔧 |

## 📁 Architecture

### API Routes

```
/api/auth/
  ├── signup/route.ts    # Création de compte
  ├── login/route.ts     # Connexion
  ├── logout/route.ts    # Déconnexion
  └── me/route.ts        # Utilisateur courant
```

### Pages

```
/login    # Page de connexion
/signup   # Page d'inscription
```

### Middleware

`middleware.ts` protège automatiquement toutes les routes sauf `/login` et `/signup`.

Si un utilisateur non connecté essaie d'accéder à l'app, il est redirigé vers `/login`.

## 🔒 Sécurité

### Hashage des mots de passe

- Utilise **bcryptjs** avec un salt de 10 rounds
- Les mots de passe ne sont jamais stockés en clair
- Comparaison sécurisée avec `bcrypt.compare()`

### JWT (JSON Web Tokens)

- Tokens signés avec `jsonwebtoken`
- Durée de vie : **7 jours**
- Stockés dans un cookie **httpOnly** (non accessible en JavaScript)
- Cookie **secure** en production (HTTPS uniquement)

### Validation

- Email obligatoire et unique
- Mot de passe minimum 6 caractères
- Validation côté serveur dans les API routes

## 🛠️ Utilisation

### Créer un compte

```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword123',
  }),
});

const { user } = await response.json();
```

### Se connecter

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securepassword123',
  }),
});

const { user } = await response.json();
```

### Se déconnecter

```typescript
await fetch('/api/auth/logout', { method: 'POST' });
router.push('/login');
```

### Récupérer l'utilisateur courant

```typescript
const response = await fetch('/api/auth/me');
const { user } = await response.json();
```

## 🔧 Fonctions utilitaires (`lib/auth.ts`)

```typescript
// Hasher un mot de passe
const hash = await hashPassword('mypassword');

// Vérifier un mot de passe
const isValid = await verifyPassword('mypassword', hash);

// Créer un token JWT
const token = createToken({ userId: '123', email: 'user@example.com' });

// Vérifier un token JWT
const payload = verifyToken(token);

// Gérer les cookies (côté serveur uniquement)
setAuthCookie(token);
const token = getAuthCookie();
removeAuthCookie();

// Récupérer l'utilisateur courant (côté serveur)
const user = getCurrentUser();
```

## 📊 Schéma de la table `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  avatar TEXT DEFAULT '👤',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

## 🎨 Composants UI

### UserSelector

Affiche l'utilisateur connecté avec un menu dropdown :
- Nom et email
- Bouton de déconnexion

## 🔄 Flow d'authentification

```
1. Utilisateur visite l'app
   ↓
2. Middleware vérifie le cookie JWT
   ↓
3a. Token valide → Accès à l'app
3b. Token invalide/absent → Redirection vers /login
   ↓
4. Login/Signup → Token créé → Cookie défini
   ↓
5. Redirection vers l'app
```

## 🧪 Scripts utiles

### Créer des utilisateurs de test

```bash
node scripts/create-test-users.js
```

### Vérifier les utilisateurs dans la DB

```bash
npm run db:shell
SELECT id, name, email FROM users;
```

## 📝 Notes de développement

- Les cookies sont **httpOnly** pour éviter les attaques XSS
- Les tokens expirent après 7 jours
- Le middleware protège automatiquement toutes les routes
- Les API routes utilisent `getCurrentUser()` pour récupérer l'utilisateur
- En production, utiliser HTTPS et changer `JWT_SECRET`

## 🚨 TODO Production

Avant de déployer en production :

1. ✅ Changer `JWT_SECRET` dans les variables d'environnement
2. ✅ Utiliser HTTPS (les cookies secure sont activés automatiquement)
3. ✅ Ajouter rate limiting sur les routes d'authentification
4. ✅ Implémenter la récupération de mot de passe
5. ✅ Ajouter la vérification d'email
6. ✅ Logger les tentatives de connexion échouées
7. ✅ Implémenter 2FA (optionnel)

---

**Créé le** : 17 décembre 2024  
**Version** : 1.0.0


