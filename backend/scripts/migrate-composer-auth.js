const { Client } = require('pg');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { hash, salt };
}

const client = new Client({ connectionString: 'postgres://postgres:Alex$2020@localhost:5432/piano_colombia_db' });

async function migrate() {
  await client.connect();
  console.log('Connected to DB');

  // Add columns if they don't exist
  await client.query(`
    ALTER TABLE composer
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS salt TEXT;
  `);
  console.log('Columns password_hash and salt added/verified in table composer.');

  // Set password for edwin.soto@globalbit.co -> password123
  const { hash, salt } = hashPassword('password123');
  const res = await client.query(`
    UPDATE composer
    SET password_hash = $1, salt = $2
    WHERE email = $3
    RETURNING id, email, artistic_name
  `, [hash, salt, 'edwin.soto@globalbit.co']);

  console.log('Updated password for composer:', res.rows[0]);
  await client.end();
}

migrate().catch(console.error);
