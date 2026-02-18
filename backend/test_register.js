const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:7000/api/auth/register', {
            name: "Test User",
            email: "duplicate_test@example.com",
            password: "password123"
        });
        console.log("Status:", res.status);
        console.log("Data:", res.data);
    } catch (error) {
        if (error.response) {
            console.log("Error Status:", error.response.status);
            console.log("Error Data:", error.response.data);
        } else {
            console.log("Error:", error.message);
        }
    }
}

testRegister();
