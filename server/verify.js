// Using global fetch

const API_URL = 'http://localhost:3000/api';

async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(`Login failed for ${email}: ${res.statusText}`);
    const data = await res.json();
    return data.token;
}

async function verifyProfileUpdate() {
    console.log('Testing Profile Update...');
    const token = await login('user@aura.com', 'password123');
    const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: "Verified User",
            addresses: [{ id: 1, city: "Verification City", location: { lat: 41.3, lng: 69.2 } }]
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Profile update failed: ${err}`);
    }
    console.log('✅ Profile Update Success');
}

async function verifyPartnerStats() {
    console.log('Testing Partner Stats...');
    const token = await login('partner@aura.com', 'password123');
    const res = await fetch(`${API_URL}/partner/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Partner stats failed: ${err}`);
    }
    const data = await res.json();
    // Check if it returns expected structure
    if (data.revenue === undefined || data.orders === undefined) {
        throw new Error('Invalid stats response format');
    }
    console.log('✅ Partner Stats Success');
}

async function main() {
    try {
        await verifyProfileUpdate();
        await verifyPartnerStats();
        console.log('🎉 All verifications passed!');
    } catch (e) {
        console.error('❌ Verification Failed:', e);
        process.exit(1);
    }
}

main();
