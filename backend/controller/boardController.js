const Board = require("../models/Board");

// CREATE BOARD
// CREATE BOARD
exports.createBoard = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Check for duplicate board name for this user
    const existingBoard = await Board.findOne({
      title,
      members: req.user
    });

    if (existingBoard) {
      return res.status(400).json({ message: "A board with this name already exists." });
    }

    const board = await Board.create({
      title,
      owner: req.user,   // 🔥 login user id from middleware
      members: [req.user]  // owner automatically member
    });

    res.status(201).json({
      message: "Board created successfully",
      board
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL BOARDS
exports.getAllBoards = async (req, res) => {
  try {
    // Fetch ALL boards so everyone can see and join them
    const boards = await Board.find();

    res.status(200).json({ boards });
  } catch (error) {
    console.error("GET BOARDS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getBoards = async (req, res) => {
  try {
    // Show ALL boards to everyone
    const boards = await Board.find();

    res.status(200).json({
      count: boards.length,
      boards
    });

  } catch (error) {
    console.log(error);  // 👈 add this
    res.status(500).json({ message: "Server Error" });
  }
};

// GET SINGLE BOARD
exports.getBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.status(200).json(board);
  } catch (error) {
    console.error("GET BOARD ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE BOARD
exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id);

    if (!board) return res.status(404).json({ message: "Board not found" });

    // Check ownership (only owner can delete)
    if (board.owner.toString() !== req.user) {
      return res.status(403).json({ message: "Only the board owner can delete it." });
    }

    await Board.findByIdAndDelete(id);

    res.status(200).json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

