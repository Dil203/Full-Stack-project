const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        required: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } }); // Only need createdAt

module.exports = mongoose.model("History", historySchema);
