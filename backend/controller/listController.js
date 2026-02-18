const List = require("../models/List");
const Board = require("../models/Board");
const { logActivity } = require("./historyController");

// CREATE LIST
exports.createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Shared Board: Allow all logged-in users to create lists
    // if (!board.members.some(member => member.toString() === req.user)) {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    const list = await List.create({
      title,
      boardId,
      position: (await List.countDocuments({ boardId })) + 1
    });

    // Real-time Update
    const io = req.app.get("io");
    io.to(boardId).emit("listCreated", list);

    // Activity Log
    await logActivity(io, boardId, req.user, `created list "${list.title}"`);

    res.status(201).json({
      message: "List created successfully",
      list
    });

  } catch (error) {
    console.log("CREATE LIST ERROR 👉", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET LISTS BY BOARD
exports.getListsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    // Check if user has access to board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    // Shared Board: Allow all logged-in users to view lists
    // if (!board.members.some(member => member.toString() === req.user)) {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    const lists = await List.find({ boardId }).sort("position");

    res.status(200).json(lists);
  } catch (error) {
    console.log("GET LISTS ERROR 👉", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE LIST
exports.updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, position } = req.body;

    const list = await List.findByIdAndUpdate(
      id,
      { $set: { title, position } },
      { new: true }
    );

    if (!list) return res.status(404).json({ message: "List not found" });

    // Real-time Update
    const io = req.app.get("io");
    io.to(list.boardId.toString()).emit("listUpdated", list);

    // Activity Log
    await logActivity(io, list.boardId, req.user, `updated list "${list.title}"`);

    res.status(200).json(list);
  } catch (error) {
    console.log("UPDATE LIST ERROR 👉", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE LIST
exports.deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findById(id);
    if (!list) return res.status(404).json({ message: "List not found" });

    await List.findByIdAndDelete(id);

    // Real-time Update
    const io = req.app.get("io");
    io.to(list.boardId.toString()).emit("listDeleted", id);

    // Activity Log
    await logActivity(io, list.boardId, req.user, `deleted list "${list.title}"`);

    res.status(200).json({ message: "List deleted successfully" });
  } catch (error) {
    console.log("DELETE LIST ERROR 👉", error);
    res.status(500).json({ message: "Server Error" });
  }
};
