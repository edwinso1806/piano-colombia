const { Client } = require('pg');
const client = new Client('postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db');
async function run() {
  await client.connect();
  console.log("Dropping hardcoded check constraints on score table to support dynamic CMS categories & difficulties...");
  await client.query("ALTER TABLE score DROP CONSTRAINT IF EXISTS score_difficulty_check;");
  await client.query("ALTER TABLE score DROP CONSTRAINT IF EXISTS score_genre_check;");
  console.log("Constraints dropped successfully!");
  await client.end();
}
run().catch(console.error);
