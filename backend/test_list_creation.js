const axios = require('axios');

const API_URL = 'http://localhost:7000/api';

async function testListCreation() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: "duplicate_test@example.com", // Using the user created in previous step
            password: "password123"
        });
        const token = loginRes.data.token;
        console.log("Login successful. Token:", token ? "Received" : "Missing");

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Create Board
        console.log("Creating Board...");
        const boardRes = await axios.post(`${API_URL}/boards`, {
            title: "Test Board " + Date.now()
        }, config);
        const boardId = boardRes.data.board._id;
        console.log("Board created:", boardId);

        // 3. Create List
        console.log("Creating List...");
        const listRes = await axios.post(`${API_URL}/lists`, {
            title: "Test List",
            boardId: boardId
        }, config);
        console.log("List creation response:", listRes.status, listRes.data);

    } catch (error) {
        if (error.response) {
            console.log("Error Status:", error.response.status);
            console.log("Error Data:", error.response.data);
        } else {
            console.log("Error:", error.message);
        }
    }
}

testListCreation();
