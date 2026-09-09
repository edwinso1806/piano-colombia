const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:Alex$2020@localhost:5432/piano_colombia_db' });

async function run() {
  await client.connect();
  const comp = await client.query('SELECT * FROM composer WHERE email = $1', ['edwin.soto@globalbit.co']);
  console.log('COMPOSER ROW:', comp.rows[0]);
  const cust = await client.query('SELECT * FROM customer_account WHERE email = $1', ['edwin.soto@globalbit.co']);
  console.log('CUSTOMER ROW:', cust.rows[0]);
  const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'composer'");
  console.log('COMPOSER COLS:', cols.rows.map(r => r.column_name));
  await client.end();
}

run().catch(console.error);
