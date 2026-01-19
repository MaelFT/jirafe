#!/usr/bin/env node

/**
 * Script pour créer des utilisateurs de test avec des mots de passe hashés
 */

const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const config = {
  host: 'localhost',
  port: 5433,
  database: 'jirafe_db',
  user: 'jirafe',
  password: 'jirafe_dev_2024',
};

const testUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@jirafe.local',
    password: 'password123',
    avatar: '👩‍💼',
  },
  {
    name: 'Bob Smith',
    email: 'bob@jirafe.local',
    password: 'password123',
    avatar: '👨‍💻',
  },
  {
    name: 'Carol White',
    email: 'carol@jirafe.local',
    password: 'password123',
    avatar: '👩‍🎨',
  },
  {
    name: 'David Brown',
    email: 'david@jirafe.local',
    password: 'password123',
    avatar: '👨‍🔧',
  },
];

async function createTestUsers() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    for (const user of testUsers) {
      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(user.password, 10);

      // Mettre à jour l'utilisateur
      const result = await client.query(
        `UPDATE users 
         SET email = $1, password_hash = $2 
         WHERE name = $3
         RETURNING id, name, email`,
        [user.email, passwordHash, user.name]
      );

      if (result.rows.length > 0) {
        console.log(`✅ ${user.name} - ${user.email}`);
      }
    }

    console.log('\n🎉 Utilisateurs de test créés avec succès !');
    console.log('\n📝 Credentials pour se connecter :');
    console.log('   Email: alice@jirafe.local (ou bob/carol/david)');
    console.log('   Mot de passe: password123\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestUsers();


