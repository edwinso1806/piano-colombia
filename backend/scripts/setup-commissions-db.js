const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db'
});

async function run() {
  await client.connect();
  console.log('✅ Conectado a PostgreSQL');

  // 1. Agregar columna commission_percentage a composer si no existe
  await client.query('ALTER TABLE composer ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2) NULL;');
  console.log('✅ Columna commission_percentage verificada/agregada');

  // 2. Crear tabla de configuraciones globales de la plataforma
  await client.query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Insertar comisión general inicial si no existe (20%)
  await client.query(`
    INSERT INTO platform_settings (key, value)
    VALUES ('default_commission_percentage', '20')
    ON CONFLICT (key) DO NOTHING;
  `);
  console.log('✅ Tabla platform_settings lista con comisión general por defecto (20%)');

  // 4. Consultar solicitudes pendientes reales
  const compRes = await client.query("SELECT id, artistic_name, first_name, last_name, email, status, commission_percentage FROM composer;");
  console.log('Compositores en BD:', compRes.rows);

  const scoreRes = await client.query("SELECT id, title, composer_id, price_cop, status FROM score;");
  console.log('Partituras en BD:', scoreRes.rows);

  await client.end();
}

run().catch(console.error);
