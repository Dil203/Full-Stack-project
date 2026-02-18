# API Documentation

Base URL: `http://localhost:7000/api`

## Authentication

### POST `/auth/register`
Register a new user.
-   **Body**: `{ "name": "John", "email": "john@example.com", "password": "123" }`
-   **Response**: `{ "token": "jwt_token", "user": { ... } }`

### POST `/auth/login`
Login existing user.
-   **Body**: `{ "email": "john@example.com", "password": "123" }`
-   **Response**: `{ "token": "jwt_token", "user": { ... } }`

## Boards

### GET `/boards`
Get all boards for the logged-in user.
-   **Headers**: `Authorization: Bearer <token>`

### POST `/boards`
Create a new board.
-   **Headers**: `Authorization: Bearer <token>`
-   **Body**: `{ "title": "Project Alpha" }`

### DELETE `/boards/:id`
Delete a board.
-   **Headers**: `Authorization: Bearer <token>`

## Lists

### GET `/lists/:boardId`
Get all lists for a specific board.

### POST `/lists`
Create a new list.
-   **Body**: `{ "title": "To Do", "boardId": "board_id" }`

### DELETE `/lists/:id`
Delete a list.

## Tasks

### GET `/tasks/:listId`
Get all tasks in a list.

### POST `/tasks`
Create a new task.
-   **Body**: `{ "title": "Fix Bug", "listId": "list_id" }`

### PUT `/tasks/:id`
Update task (move to new list or reorder).
-   **Body**: `{ "listId": "new_list_id", "position": 1 }`

### DELETE `/tasks/:id`
Delete a task.
