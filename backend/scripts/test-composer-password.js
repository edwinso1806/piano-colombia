async function testLogin(email, password) {
  const res = await fetch('http://localhost:9000/store/auth/composer/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': 'pk_0372bd6f8b5885e7dcfd759e152d7a9db36782d5eaace95f07e707f2e9f68ce3',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  console.log(`Testing [${email}] with password [${password}]: status=${res.status}`, data.message || data.success);
}

async function run() {
  await testLogin('edwin.soto@globalbit.co', 'wrongpassword');
  await testLogin('edwin.soto@globalbit.co', 'cualquiera');
  await testLogin('edwin.soto@globalbit.co', 'password123');
}

run().catch(console.error);
