# Real-Time Task Collaboration Platform (Hintro)

A lightweight Kanban-style task management application (similar to Trello) built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for real-time collaboration.

## Features

-   **Authentication**: User Signup and Login (JWT-based).
-   **Boards**: Create multiple boards to organize projects.
-   **Lists**: Create lists (e.g., "To Do", "In Progress", "Done") within boards.
-   **Tasks**: Add, edit, and delete tasks (players) within lists.
-   **Drag & Drop**: Intuitive drag-and-drop interface for moving tasks between lists.
-   **Real-Time Updates**: Instant updates across all connected clients using WebSockets.
-   **Validation**: Backend validation and duplicate checks.

## Tech Stack

### Frontend
-   **React**: UI Library
-   **Vite**: Build tool
-   **@hello-pangea/dnd**: Drag and drop library
-   **Socket.IO Client**: Real-time communication
-   **Axios**: HTTP client
-   **React Router**: Navigation

### Backend
-   **Node.js & Express**: Server framework
-   **MongoDB & Mongoose**: Database and ODM
-   **Socket.IO**: Real-time event handling
-   **JWT (JSON Web Tokens)**: Authentication
-   **Bcrypt**: Password hashing

## Setup Instructions

### Prerequisites
-   Node.js (v14+ recommended)
-   MongoDB (Running locally or Atlas connection string)

### 1. Clone/Download the Repository
Ensure you have the project files on your local machine.

### 2. Environment Variables
The backend comes with a `.env` file (or create one in `backend/.env`):
```env
MONGO_URL=mongodb+srv://<your_connection_string>
JWT_SECRET=your_super_secret_key
PORT=7000
```

### 3. Install Dependencies
You can install dependencies for both frontend and backend manually, or use the provided script.

**Manual Install:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the Application
We have provided a convenient batch script to start both servers at once.

**Windows:**
Double-click `start-dev.bat` in the root directory.

**Manual Start:**
Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Access the App
Open your browser and navigate to: `http://localhost:5173`

## Directory Structure
```
fullStack/
├── backend/            # Express server & API
│   ├── controller/     # Business logic
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   └── server.js       # Entry point
├── frontend/           # React application
│   ├── src/
│   │   ├── pages/      # View components (Dashboard, BoardView)
│   │   └── api.js      # API configuration
└── start-dev.bat       # Quick start script
```
