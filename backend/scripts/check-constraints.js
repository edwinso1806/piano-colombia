const { Client } = require('pg');
const client = new Client('postgres://postgres:Colombia-93@localhost:5432/piano_colombia_db');
client.connect().then(async () => {
  const res = await client.query("SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'score'::regclass;");
  console.log(res.rows);
  await client.end();
});
