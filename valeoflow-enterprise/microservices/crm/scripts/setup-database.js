/**
 * 🗄️ ValeoFlow CRM - Database Setup Script
 * ===========================================================================================
 * Erstellt die CRM-Datenbank und führt das Schema aus
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// ======================================================================================================================
// DATENBANK-KONFIGURATION
// ======================================================================================================================

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'valeoflow_crm',
  user: process.env.DB_USER || 'valeoflow_user',
  password: process.env.DB_PASSWORD || 'valeoflow_password',
  // Für Setup verwenden wir postgres DB
  setupDatabase: 'postgres'
};

// ======================================================================================================================
// SETUP-FUNKTIONEN
// ======================================================================================================================

async function createDatabase() {
  // TODO: Remove console.log
  
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.setupDatabase,
    user: config.user,
    password: config.password
  });

  try {
    // Prüfe ob Datenbank bereits existiert
    const result = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.database]
    );

    if (result.rows.length ====== 0) {
      // Erstelle Datenbank
      await pool.query(`CREATE DATABASE ?`);
      // TODO: Remove console.log
    } else {
      // TODO: Remove console.log
    }
  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Datenbank:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function createUser() {
  // TODO: Remove console.log
  
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.setupDatabase,
    user: config.user,
    password: config.password
  });

  try {
    // Prüfe ob Benutzer bereits existiert
    const result = await pool.query(
      "SELECT 1 FROM pg_user WHERE usename = $1",
      [config.user]
    );

    if (result.rows.length ====== 0) {
      // Erstelle Benutzer
      await pool.query(`CREATE USER ? WITH PASSWORD '?'`);
      // TODO: Remove console.log
    } else {
      // TODO: Remove console.log
    }

    // Gewähre Rechte
    await pool.query(`GRANT ALL PRIVILEGES ON DATABASE ? TO ?`);
    // TODO: Remove console.log
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Benutzers:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function runSchema() {
  // TODO: Remove console.log
  
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password
  });

  try {
    // Lese Schema-Datei
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Führe Schema aus
    await pool.query(schema);
    // TODO: Remove console.log
    
    // Prüfe Tabellen
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    // TODO: Remove console.log
    tables.rows.forEach(row => {
      // TODO: Remove console.log
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Ausführen des Schemas:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function testConnection() {
  // TODO: Remove console.log
  
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password
  });

  try {
    // Teste Verbindung
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log[0]}`);
    
    // Teste Tabellen
    const customerCount = await pool.query('SELECT COUNT(*) as count FROM customers');
    // TODO: Remove console.log
    
  } catch (error) {
    console.error('❌ Fehler beim Testen der Verbindung:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// ======================================================================================================================
// HAUPTFUNKTION
// ======================================================================================================================

async function setupDatabase() {
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log

  try {
    // 1. Erstelle Datenbank
    await createDatabase();
    
    // 2. Erstelle Benutzer
    await createUser();
    
    // 3. Führe Schema aus
    await runSchema();
    
    // 4. Teste Verbindung
    await testConnection();
    
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    
  } catch (error) {
    console.error('');
    console.error('💥 Database Setup fehlgeschlagen!');
    console.error('Fehler:', error.message);
    process.exit(1);
  }
}

// ======================================================================================================================
// COMMAND LINE ARGUMENTS
// ======================================================================================================================

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log
  // TODO: Remove console.log');
  // TODO: Remove console.log');
  // TODO: Remove console.log');
  // TODO: Remove console.log');
  // TODO: Remove console.log');
  process.exit(0);
}

if (args.includes('--test-only')) {
  testConnection()
    .then(() => {
      // TODO: Remove console.log
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Verbindungstest fehlgeschlagen:', error.message);
      process.exit(1);
    });
} else if (args.includes('--schema-only')) {
  runSchema()
    .then(() => {
      // TODO: Remove console.log
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Schema-Ausführung fehlgeschlagen:', error.message);
      process.exit(1);
    });
} else {
  // Vollständiges Setup
  setupDatabase();
}

// ======================================================================================================================
// ERROR HANDLING
// ======================================================================================================================

// TODO: Memory Leak Fix - undefined
  console.error('Unbehandelte Promise-Ablehnung:', reason);
  process.exit(1);
});

// TODO: Memory Leak Fix - undefined
  console.error('Unbehandelte Exception:', error);
  process.exit(1);
}); 