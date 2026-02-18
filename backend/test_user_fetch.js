const axios = require('axios');

async function testFetchUsers() {
    try {
        const testUser = {
            name: "TestUserFetch",
            email: `fetchtest_${Date.now()}@example.com`,
            password: "123"
        };

        // 1. Initial Register (to ensure user exists)
        console.log("1. Registering user for testing...");
        const registerRes = await axios.post('http://localhost:7000/api/auth/register', testUser);
        console.log("   Registration successful.");

        const token = registerRes.data.token; // Registration returns token usually
        // If not, we login...
        // But let's check the register response first.
        // Assuming your register controller returns { token, user } as per code I reviewed.

        // 2. Fetch Users
        console.log("\n2. Fetching Users...");
        const usersRes = await axios.get('http://localhost:7000/api/auth/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("   Status:", usersRes.status); // Should be 200
        console.log("   Number of users found:", usersRes.data.length);
        console.log("   First user sample:", usersRes.data[0]);

    } catch (error) {
        if (error.response) {
            console.error("\n❌ Error:", error.response.status, error.response.data);
        } else {
            console.error("\n❌ Error:", error.message);
        }
    }
}

testFetchUsers();
