const Task = require("../models/Task");
const List = require("../models/List");
const { logActivity } = require("./historyController");

// CREATE TASK
exports.createTask = async (req, res) => {
    try {
        const { title, description, listId, assignees } = req.body;

        const list = await List.findById(listId);
        if (!list) return res.status(404).json({ message: "List not found" });

        // Calculate position (append to end)
        const position = (await Task.countDocuments({ listId })) + 1;

        const task = await Task.create({
            title,
            description,
            listId,
            assignees,
            position
        });

        // Populate to get Board and User details for log
        const user = await require("../models/User").findById(req.user);


        // Real-time Update
        const io = req.app.get("io");
        io.to(list.boardId.toString()).emit("taskCreated", task);

        // Activity Log
        console.log("Calling logActivity...");
        console.log("io exists?", !!io);
        console.log("list.boardId:", list.boardId);
        console.log("req.user.id:", req.user.id);

        // Activity Log
        // Format: "User added 'Task Title' in 'List Title' list"
        const logDescription = `added task "${task.title}" in "${list.title}" list`;

        await logActivity(io, list.boardId, req.user, logDescription);

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.log("CREATE TASK ERROR 👉", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET TASKS 
exports.getTasksByList = async (req, res) => {
    try {
        const { listId } = req.params;
        const { page = 1, limit = 10, search = "" } = req.query;

        const query = { listId };
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        const tasks = await Task.find(query)
            .sort("position")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('assignees', 'name');

        const total = await Task.countDocuments(query);

        res.status(200).json({
            tasks,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("GET TASKS ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const originalTask = await Task.findById(id);
        if (!originalTask) return res.status(404).json({ message: "Task not found" });

        const task = await Task.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).populate('assignees', 'name'); // Populate user details

        // Need to find boardId. We can get it from the list.
        const list = await List.findById(task.listId);

        // Real-time Update
        if (list) {
            const io = req.app.get("io");
            // Emit the fully populated task
            io.to(list.boardId.toString()).emit("taskUpdated", task);

            // Activity Log
            const user = await require("../models/User").findById(req.user);
            const logDescription = `updated task "${task.title}" in "${list.title}" list`;
            await logActivity(io, list.boardId, req.user, logDescription);
        }

        res.status(200).json(task);
    } catch (error) {
        console.error("UPDATE TASK ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const list = await List.findById(task.listId);

        await Task.findByIdAndDelete(id);

        // Real-time Update
        if (list) {
            const io = req.app.get("io");
            io.to(list.boardId.toString()).emit("taskDeleted", id);

            // Activity Log
            const user = await require("../models/User").findById(req.user);
            const logDescription = `deleted task "${task.title}" from "${list.title}" list`;
            await logActivity(io, list.boardId, req.user, logDescription);
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
