const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List",
        required: true
    },
    assignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    position: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
