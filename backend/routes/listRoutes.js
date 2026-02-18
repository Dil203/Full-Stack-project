const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    createList,
    getListsByBoard,
    updateList,
    deleteList
} = require("../controller/listController");

router.post("/", protect, createList);
router.get("/:boardId", protect, getListsByBoard);
router.put("/:id", protect, updateList);
router.delete("/:id", protect, deleteList);

module.exports = router;
