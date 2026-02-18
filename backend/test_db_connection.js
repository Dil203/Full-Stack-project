const mongoose = require('mongoose');
require('dotenv').config();

const mongoUrl = process.env.MONGO_URL;

console.log("Testing connection to:", mongoUrl.replace(/:([^:@]+)@/, ':****@')); // Hide password

mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
    .then(() => {
        console.log("✅ MongoDB Connected Successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Connection Failed!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.reason) {
            console.error("Reason Type:", err.reason.type);
            if (err.reason.servers) {
                console.error("Servers found:", err.reason.servers.size);
            }
        }
        console.log("\nPossible Causes:");
        console.log("1. Your IP Address is not whitelisted in MongoDB Atlas.");
        console.log("   -> Go to Network Access -> Add IP Address -> Add Current IP Address");
        console.log("2. Incorrect username/password (less likely with this specific error).");
        console.log("3. Firewall blocking port 27017.");
        process.exit(1);
    });
