#!/usr/bin/env node

/**
 * Script de migration pour initialiser la base de données PostgreSQL
 * Usage: node scripts/migrate.js
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const postgres = require('postgres');

// Essayer de charger .env.local si disponible
try {
  require('dotenv').config({ path: join(__dirname, '..', '.env.local') });
} catch (e) {
  // Pas de dotenv installé, on continue
}

// Configuration avec paramètres séparés (plus fiable que connection string)
const connectionConfig = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'jirafe_db',
  username: process.env.PGUSER || 'jirafe',
  password: process.env.PGPASSWORD || 'jirafe_dev_2024',
};

console.log('🔗 Connexion à PostgreSQL:');
console.log(`   Host: ${connectionConfig.host}:${connectionConfig.port}`);
console.log(`   Database: ${connectionConfig.database}`);
console.log(`   User: ${connectionConfig.username}`);

async function migrate() {
  const sql = postgres(connectionConfig);

  try {
    console.log('🔄 Connexion à PostgreSQL...');
    
    // Lire le fichier SQL d'initialisation (version simplifiée sans RLS)
    const sqlFile = join(__dirname, '..', 'init-db-simple.sql');
    const sqlContent = readFileSync(sqlFile, 'utf-8');
    
    console.log('📝 Exécution des migrations...');
    
    // Exécuter le SQL
    await sql.unsafe(sqlContent);
    
    console.log('✅ Migration terminée avec succès !');
    console.log('');
    console.log('🎉 La base de données est prête à l\'usage');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();

