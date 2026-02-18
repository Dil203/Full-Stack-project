# System Architecture

## Overview
The application follows a standard **Client-Server architecture** using the MERN stack. It leverages **REST APIs** for standard CRUD operations and **WebSockets (Socket.IO)** for real-time bi-directional communication to ensure all users see board updates instantly.

## 1. Frontend Architecture
The frontend is a **Single Page Application (SPA)** built with React and Vite.

*   **Component Structure**:
    *   `App.jsx`: Main entry point, handles routing (React Router).
    *   `AuthProvider`: Manages global user state (login/logout) using React Context API.
    *   `Dashboard`: Displays list of boards.
    *   `BoardView`: Complex view handling Lists, Tasks, and Drag & Drop (using `@hello-pangea/dnd`).
*   **State Management**:
    *   `useState` & `useEffect` for local component state.
    *   `Context API` (`AuthContext`) for global user authentication state.
    *   Real-time state updates triggered by Socket.IO events (e.g., `listUpdated` re-fetches data).
*   **Real-time Strategy**:
    *   The frontend connects to the Socket.IO server on load.
    *   When joining a board, it emits `joinBoard(boardId)`.
    *   It listens for events (`taskCreated`, `taskMoved`, etc.) and triggers data refreshes (`fetchLists()`) to sync the UI.

## 2. Backend Architecture
The backend is a **RESTful API** built with Node.js and Express.

*   **Layered Architecture**:
    *   **Routes**: Define endpoints (e.g., `/api/boards`, `/api/tasks`).
    *   **Controllers**: Handle business logic and request processing.
    *   **Models**: Mongoose schemas defining data structure.
    *   **Middleware**: `authMiddleware` for JWT verification.
*   **Real-Time Layer**:
    *   `server.js` initializes `socket.io`.
    *   Socket logic is integrated into controllers. For example, when a task is moved in `taskController`, the server emits a `taskUpdated` event to the specific `boardId` room.

## 3. Database Schema (MongoDB)

### User
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique ID |
| `name` | String | User's display name |
| `email` | String | Unique email |
| `password` | String | Hashed password (Bcrypt) |

### Board
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique ID |
| `title` | String | Board name |
| `owner` | ObjectId | Ref -> User |
| `members` | [ObjectId] | Array of User Refs |

### List
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique ID |
| `title` | String | List name |
| `boardId` | ObjectId | Ref -> Board |
| `position` | Number | Sorting order (planned) |

### Task
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique ID |
| `title` | String | Task content |
| `listId` | ObjectId | Ref -> List |
| `assignees`| [ObjectId] | Ref -> User (Array) |
| `position` | Number | Order within list |

## 4. Scalability Considerations
*   **Database**: MongoDB is document-oriented and scales horizontally. Indexing `boardId` and `listId` ensures fast queries.
*   **WebSockets**: Socket.IO can use Redis Adapter for scaling across multiple server instances (pub/sub).
*   **Frontend**: Vite provides optimized production builds (code splitting).
