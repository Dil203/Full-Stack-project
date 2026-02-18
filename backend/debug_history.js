const mongoose = require("mongoose");
const dotenv = require("dotenv");
const History = require("./models/History");
const User = require("./models/User");
const Board = require("./models/Board");

dotenv.config();

const debugHistory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ DB Connected");

        // 1. Get a user and board
        const user = await User.findOne();
        const board = await Board.findOne();

        if (!user || !board) {
            console.log("❌ Need at least one user and board in DB to test");
            return;
        }

        console.log(`User: ${user.name} (${user._id})`);
        console.log(`Board: ${board.title} (${board._id})`);

        // 2. Try creating a history item directly
        console.log("Attempting to save history...");
        const history = await History.create({
            description: "Debug Log Entry",
            user: user._id,
            boardId: board._id
        });

        console.log("✅ History Saved:", history);

        // 3. Fetch it back
        const fetched = await History.findById(history._id).populate("user");
        console.log("✅ Fetched Back:", fetched);

    } catch (error) {
        console.error("❌ ERROR:", error);
    } finally {
        mongoose.disconnect();
    }
};

debugHistory();
