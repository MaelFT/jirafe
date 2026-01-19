# 📝 Changelog - Jirafe

## [2.0.0] - 17 Décembre 2024

### 🔐 Authentification complète ajoutée

#### Ajouts majeurs

- **Système d'authentification JWT** avec cookies httpOnly
- **Pages de connexion et inscription** (`/login` et `/signup`)
- **Protection automatique des routes** via middleware Next.js
- **Hashage sécurisé des mots de passe** avec bcryptjs (10 rounds)
- **Menu utilisateur** avec dropdown et déconnexion

#### Modifications de la base de données

```sql
-- Nouvelles colonnes dans la table users
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN password_hash TEXT;
CREATE INDEX idx_users_email ON users(email);
```

#### Nouvelles API Routes

- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/logout` - Se déconnecter
- `GET /api/auth/me` - Récupérer l'utilisateur courant

#### Nouvelles pages

- `/login` - Page de connexion avec design moderne
- `/signup` - Page d'inscription avec validation

#### Nouveaux fichiers

```
lib/auth.ts                          # Utilitaires d'authentification
middleware.ts                        # Protection des routes
app/api/auth/signup/route.ts        # API signup
app/api/auth/login/route.ts         # API login
app/api/auth/logout/route.ts        # API logout
app/api/auth/me/route.ts            # API utilisateur courant
app/login/page.tsx                   # Page de connexion
app/signup/page.tsx                  # Page d'inscription
components/ui/dropdown-menu.tsx      # Composant UI dropdown
scripts/create-test-users.js         # Script pour créer des utilisateurs de test
migrations/add_auth_to_users.sql     # Migration SQL
README-AUTH.md                       # Documentation authentification
```

#### Composants modifiés

- `components/user-selector.tsx` - Transformé en menu utilisateur avec déconnexion

#### Dépendances ajoutées

```json
{
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6",
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6"
}
```

#### Variables d'environnement

Nouvelle variable dans `.env.local` :
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
```

#### Comptes de test

4 comptes créés pour le développement :
- `alice@jirafe.local` / `password123`
- `bob@jirafe.local` / `password123`
- `carol@jirafe.local` / `password123`
- `david@jirafe.local` / `password123`

#### Sécurité

- ✅ Mots de passe hashés avec bcrypt (jamais en clair)
- ✅ Tokens JWT signés et vérifiés
- ✅ Cookies httpOnly (protection XSS)
- ✅ Cookies secure en production (HTTPS)
- ✅ Validation email unique
- ✅ Validation mot de passe minimum 6 caractères
- ✅ Protection automatique des routes via middleware
- ✅ Redirection automatique si non connecté

#### Flow utilisateur

1. Utilisateur non connecté → Redirigé vers `/login`
2. Login/Signup → Token JWT créé → Cookie défini
3. Redirection vers l'app principale
4. Accès à toutes les fonctionnalités
5. Menu utilisateur en haut à droite pour se déconnecter

---

## [1.0.0] - Novembre 2024

### Migration Supabase → PostgreSQL

- Migration complète de Supabase vers PostgreSQL local
- Configuration Docker pour PostgreSQL
- API Routes pour toutes les opérations DB
- Adaptation de tous les composants

### Fonctionnalités initiales

- Gestion de boards (tableaux)
- Colonnes personnalisables
- Cartes avec détails
- Tags et sous-tâches
- Commentaires et activités
- Vues multiples (Board, List, Calendar)
- Recherche et filtres

---

**Prochaines étapes suggérées** :
- [ ] Récupération de mot de passe oublié
- [ ] Vérification d'email
- [ ] Rate limiting sur les routes d'authentification
- [ ] Logs des tentatives de connexion
- [ ] 2FA (optionnel)
- [ ] Page de profil utilisateur


