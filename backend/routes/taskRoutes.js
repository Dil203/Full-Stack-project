const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    createTask,
    getTasksByList,
    updateTask,
    deleteTask
} = require("../controller/taskController");

router.post("/", protect, createTask);
router.get("/:listId", protect, getTasksByList);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
