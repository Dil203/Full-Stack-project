const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createBoard, getBoards, deleteBoard, getBoard } = require("../controller/boardController");


// Protected route
router.post("/", protect, createBoard);
router.get("/", protect, getBoards);
router.get("/:id", protect, getBoard);
router.delete("/:id", protect, deleteBoard);

module.exports = router;
