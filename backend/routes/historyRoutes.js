const express = require("express");
const router = express.Router();
const { getHistoryByBoard, deleteHistory } = require("../controller/historyController");
const protect = require("../middleware/authMiddleware");

router.get("/:boardId", protect, getHistoryByBoard);
router.delete("/:boardId", protect, deleteHistory);

module.exports = router;
