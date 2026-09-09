const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db'
});

async function run() {
  await client.connect();

  // 1. Eliminar cuentas bancarias de las solicitudes de prueba
  await client.query(`
    DELETE FROM composer_bank_account 
    WHERE composer_id IN (
      SELECT id FROM composer 
      WHERE email IN ('uribe.holguin@pianocolombia.com', 'maestro.uribe@pianocolombia.com')
    );
  `);

  // 2. Eliminar solicitudes de prueba antiguas creadas con guillermo uribe
  const del = await client.query(`
    DELETE FROM composer 
    WHERE email IN ('uribe.holguin@pianocolombia.com', 'maestro.uribe@pianocolombia.com');
  `);
  console.log('✅ Eliminadas solicitudes de prueba:', del.rowCount);

  // Consultar la única solicitud real pendiente
  const pending = await client.query(`
    SELECT id, artistic_name, first_name, last_name, email, phone, status 
    FROM composer 
    WHERE status = 'PENDING_APPROVAL';
  `);
  console.log('✅ Solicitudes pendientes reales en BD:', pending.rows);

  await client.end();
}

run().catch(console.error);
