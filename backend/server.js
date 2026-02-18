const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const boardRoutes = require("./routes/boardRoutes");
const listRoutes = require("./routes/listRoutes");
const taskRoutes = require("./routes/taskRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"], // Allow multiple frontend ports
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinBoard", (boardId) => {
        socket.join(boardId);
        console.log(`User ${socket.id} joined board: ${boardId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Make io accessible in routes
app.set("io", io);

const PORT = process.env.PORT || 7000;

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/history", require("./routes/historyRoutes"));

// Connect DB & Start Server
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected ✅");
        server.listen(PORT, () => {
            console.log(`Server started successfully at http://localhost:${PORT} ⏰`);
        });
    })
    .catch((error) => {
        console.log("DB Connection Error:", error);
    });

module.exports = { app, io }; // Export if needed for tests
