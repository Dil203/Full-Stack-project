const History = require("../models/History");

// GET HISTORY BY BOARD
exports.getHistoryByBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const history = await History.find({ boardId })
            .sort({ createdAt: -1 })
            .limit(50) // Limit to last 50 actions
            .populate("user", "name");

        res.status(200).json(history);
    } catch (error) {
        console.error("GET HISTORY ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Helper to create log (internal use)
exports.logActivity = async (io, boardId, userId, description) => {
    try {
        console.log("📝 LOGGING ACTIVITY:", { boardId, userId, description });

        const history = await History.create({
            description,
            user: userId,
            boardId
        });
        console.log("✅ History item created:", history._id);

        // Populate user to send full info to frontend
        await history.populate("user", "name");

        // Emit event
        if (io) {
            console.log(`📡 Emitting 'historyLog' to board room: ${boardId.toString()}`);
            io.to(boardId.toString()).emit("historyLog", history);
        } else {
            console.error("❌ Socket.IO instance 'io' is undefined!");
        }
    } catch (error) {
        console.error("LOG ACTIVITY ERROR:", error);
    }
};

// CLEAR HISTORY BY BOARD
exports.deleteHistory = async (req, res) => {
    try {
        const { boardId } = req.params;

        await History.deleteMany({ boardId });

        // Real-time Update
        const io = req.app.get("io");
        io.to(boardId).emit("historyCleared"); // Notify clients

        // Log this action itself? Maybe start a fresh log
        // Pass req.user directly if it's already an ID, or handle if it's an object in previous middleware changes
        // Assuming req.user is an ID based on authMiddleware
        await exports.logActivity(io, boardId, req.user, "cleared activity history");

        res.status(200).json({ message: "History cleared" });
    } catch (error) {
        console.error("DELETE HISTORY ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
