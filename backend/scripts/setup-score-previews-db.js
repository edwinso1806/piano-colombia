const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db"
});

async function main() {
  await client.connect();
  console.log('📦 Conectado a PostgreSQL...');

  // 1. Agregar preview_images a score si no existe
  await client.query(`
    ALTER TABLE score 
    ADD COLUMN IF NOT EXISTS preview_images jsonb DEFAULT '[]'::jsonb;
  `);
  console.log('✅ Columna preview_images verificada en tabla score.');

  // 2. Asegurar que platform_settings exista
  await client.query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 3. Inicializar categorías en platform_settings si no existen
  const defaultCategories = JSON.stringify([
    { id: "cat_1", title_es: "Piano Solo", title_en: "Solo Piano", count: 45, status: "VISIBLE" },
    { id: "cat_2", title_es: "Piano a 4 Manos", title_en: "Piano 4 Hands", count: 12, status: "VISIBLE" },
    { id: "cat_3", title_es: "Piano y Orquesta", title_en: "Piano & Orchestra", count: 8, status: "VISIBLE" },
    { id: "cat_4", title_es: "Música de Cámara", title_en: "Chamber Music", count: 15, status: "VISIBLE" },
    { id: "cat_5", title_es: "Piezas Pedagógicas", title_en: "Pedagogical Pieces", count: 30, status: "VISIBLE" },
    { id: "cat_6", title_es: "Piano y Electrónica", title_en: "Piano & Electronics", count: 6, status: "VISIBLE" },
  ]);

  await client.query(`
    INSERT INTO platform_settings (key, value, updated_at)
    VALUES ('catalog_categories', $1, NOW())
    ON CONFLICT (key) DO NOTHING;
  `, [defaultCategories]);

  // 4. Inicializar niveles de dificultad en platform_settings si no existen
  const defaultDifficulties = JSON.stringify([
    { id: "diff_1", code: "BEGINNER", title_es: "Principiante (Nivel 1 - 3)", title_en: "Beginner (Level 1 - 3)", status: "VISIBLE" },
    { id: "diff_2", code: "INTERMEDIATE", title_es: "Intermedio (Nivel 4 - 6)", title_en: "Intermediate (Level 4 - 6)", status: "VISIBLE" },
    { id: "diff_3", code: "ADVANCED", title_es: "Avanzado (Nivel 7 - 8)", title_en: "Advanced (Level 7 - 8)", status: "VISIBLE" },
    { id: "diff_4", code: "VIRTUOSO", title_es: "Virtuoso / Concierto", title_en: "Virtuoso / Concert", status: "VISIBLE" },
  ]);

  await client.query(`
    INSERT INTO platform_settings (key, value, updated_at)
    VALUES ('catalog_difficulties', $1, NOW())
    ON CONFLICT (key) DO NOTHING;
  `, [defaultDifficulties]);

  console.log('✅ Metadatos inicializados en platform_settings (catalog_categories, catalog_difficulties).');
  await client.end();
}

main().catch(console.error);
