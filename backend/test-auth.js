async function test() {
  try {
    let loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    
    if (loginRes.status === 401) {
      loginRes = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123' })
      });
    }

    const data = await loginRes.json();
    const token = data.accessToken;
    console.log("Token:", token);

    const dashRes = await fetch('http://localhost:5000/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Dashboard status:", dashRes.status);
    const dashData = await dashRes.json();
    console.log("Dashboard data:", dashData);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
