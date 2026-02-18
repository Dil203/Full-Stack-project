const mongoose = require("mongoose");
const dotenv = require("dotenv");
const History = require("./models/History");

dotenv.config();

const testHistory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");

        // Count existing histories
        const initialCount = await History.countDocuments();
        console.log(`Initial History Count: ${initialCount}`);

        // Dump the last 5 logs
        const lastLogs = await History.find().sort({ createdAt: -1 }).limit(5);
        console.log("Last 5 Logs:", JSON.stringify(lastLogs, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
    }
};

testHistory();
