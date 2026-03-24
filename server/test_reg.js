async function test() {
  const payload = {
    role: 'USER',
    name: 'Test',
    email: '',
    phone: '',
    password: 'Password1',
    companyName: '',
    taxId: '',
    businessCategory: 'Retail',
    businessAddress: '',
    businessDescription: ''
  };

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (e) {
    console.error(e);
  }
}
test();
