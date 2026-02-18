import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import socket from '../socket';
import { AuthContext } from '../context/AuthContext';

const BoardView = () => {
    const { id } = useParams();
    const [lists, setLists] = useState([]);
    const [newListTitle, setNewListTitle] = useState('');
    const [newTaskTitles, setNewTaskTitles] = useState({});
    const [users, setUsers] = useState([]);
    const [board, setBoard] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMyTasks, setFilterMyTasks] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchLists();
        fetchUsers();
        fetchBoardDetails();
        fetchHistory();

        // Join Board Room

        // Join Board Room
        socket.emit("joinBoard", id);

        // Listen for updates
        socket.on("listCreated", () => fetchLists());
        socket.on("listUpdated", () => fetchLists());
        socket.on("listDeleted", () => fetchLists());
        socket.on("taskCreated", () => fetchLists());
        socket.on("taskUpdated", () => fetchLists());
        socket.on("taskDeleted", () => fetchLists());
        socket.on("historyLog", (newLog) => {
            setHistory(prev => [newLog, ...prev]);
        });
        socket.on("historyCleared", () => {
            setHistory([]);
        });

        return () => {
            socket.off("listCreated");
            socket.off("listUpdated");
            socket.off("listDeleted");
            socket.off("taskCreated");
            socket.off("taskUpdated");
            socket.off("taskDeleted");
            socket.off("historyLog");
            socket.off("historyCleared");
        };
    }, [id]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBoardDetails = async () => {
        try {
            const res = await api.get(`/boards/${id}`);
            setBoard(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLists = async () => {
        try {
            const res = await api.get(`/lists/${id}`);
            const listsData = res.data;
            const listsWithTasks = await Promise.all(listsData.map(async (list) => {
                const tasksRes = await api.get(`/tasks/${list._id}`, {
                    params: { search: searchQuery, page: 1 }
                });
                return {
                    ...list,
                    tasks: tasksRes.data.tasks,
                    totalPages: tasksRes.data.totalPages,
                    currentPage: tasksRes.data.currentPage
                };
            }));
            setLists(listsWithTasks);
        } catch (error) {
            console.error(error);
        }
    };

    const loadMoreTasks = async (listId, page) => {
        try {
            const tasksRes = await api.get(`/tasks/${listId}`, {
                params: { search: searchQuery, page }
            });

            setLists(prevLists => prevLists.map(list => {
                if (list._id === listId) {
                    return {
                        ...list,
                        tasks: [...list.tasks, ...tasksRes.data.tasks],
                        totalPages: tasksRes.data.totalPages,
                        currentPage: tasksRes.data.currentPage
                    };
                }
                return list;
            }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLists();
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/history/${id}`);
            setHistory(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            window.location.reload();
        }, 500); // Wait for animation
    };

    const clearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear the entire activity history?")) return;
        try {
            await api.delete(`/history/${id}`);
            // Optimistic update not needed as socket will handle it, but good for feedback
            setHistory([]);
        } catch (error) {
            console.error(error);
        }
    };

    const assignUser = async (taskId, userId) => {
        try {
            // Optimistic update (optional but good)
            // For now just call API and refresh
            await api.put(`/tasks/${taskId}`, { assignees: [userId] }); // Overwrite for single assignee for now
            fetchLists();
        } catch (error) {
            console.error(error);
        }
    };

    const createList = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lists', { title: newListTitle, boardId: id });
            setNewListTitle('');
            fetchLists(); // Immediate update
        } catch (error) {
            console.error(error);
        }
    };

    const createTask = async (listId) => {
        if (!newTaskTitles[listId]) return;
        try {
            await api.post('/tasks', { title: newTaskTitles[listId], listId });
            setNewTaskTitles({ ...newTaskTitles, [listId]: '' });
            fetchLists(); // Immediate update
        } catch (error) {
            console.error(error);
        }
    };

    const deleteList = async (listId) => {
        if (!window.confirm("Are you sure you want to delete this list?")) return;
        try {
            await api.delete(`/lists/${listId}`);
            fetchLists();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this player?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchLists();
        } catch (error) {
            console.error(error);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        // If filtering, disable drag and drop to avoid confusion/errors on position
        if (filterMyTasks || searchQuery) {
            alert("Please clear filters/search to reorder tasks.");
            return;
        }

        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        try {
            await api.put(`/tasks/${draggableId}`, {
                listId: destination.droppableId,
                position: destination.index
            });
            fetchLists(); // Immediate update to sync state
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="board-view">
            <header className="board-header">
                <div className="header-left">
                    <Link to="/dashboard" className="nav-icon-btn" title="Back to Dashboard">←</Link>
                    <h2>{board ? board.title : 'Board'}</h2>
                    <button
                        onClick={handleRefresh}
                        className="refresh-btn"
                        title="Refresh Page"
                        style={{
                            transition: 'transform 0.5s',
                            transform: isRefreshing ? 'rotate(360deg)' : 'none'
                        }}
                    >
                        🔄
                    </button>
                </div>

                <div className="header-center">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </form>
                    <div className="header-actions">
                        <button
                            onClick={() => setFilterMyTasks(!filterMyTasks)}
                            className="header-btn"
                            style={{ backgroundColor: filterMyTasks ? '#5aac44' : '' }}
                        >
                            {filterMyTasks ? 'Show All' : 'My Tasks'}
                        </button>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="header-btn"
                        >
                            {showHistory ? 'Hide Activity' : 'Show Activity'}
                        </button>
                    </div>
                </div>

                <div className="user-profile-header">
                    {user && (
                        <>
                            <span className="profile-name">{user.name}</span>
                            <div className="profile-avatar">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div className="board-content" style={{ display: 'flex' }}>
                <div style={{ flex: 1, overflowX: 'auto' }}>
                    <div className="create-list-section">
                        <form onSubmit={createList} className="create-list-form">
                            <input
                                type="text"
                                placeholder="New List Title"
                                value={newListTitle}
                                onChange={(e) => setNewListTitle(e.target.value)}
                            />
                            <button type="submit">Add List</button>
                        </form>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="lists-grid">
                            {lists.map(list => (
                                <Droppable droppableId={list._id} key={list._id}>
                                    {(provided) => (
                                        <div
                                            className="list-card"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            <div className="list-header">
                                                <h3>{list.title}</h3>
                                                <button
                                                    className="delete-list-btn"
                                                    onClick={() => deleteList(list._id)}
                                                    title="Delete List"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            <div className="tasks-list">
                                                {list.tasks && list.tasks
                                                    .filter(task => {
                                                        if (!filterMyTasks) return true;
                                                        const currentUserId = user?.id || user?._id;
                                                        if (!currentUserId) return false;

                                                        return task.assignees && task.assignees.some(u => u._id == currentUserId);
                                                    })
                                                    .map((task, index) => (
                                                        <Draggable draggableId={task._id} index={index} key={task._id} isDragDisabled={filterMyTasks || !!searchQuery}>
                                                            {(provided) => (
                                                                <div
                                                                    className="task-card"
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <div className="task-content">
                                                                        <span>{task.title}</span>
                                                                        <button
                                                                            className="delete-task-btn"
                                                                            onClick={() => deleteTask(task._id)}
                                                                            title="Delete Player"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                    <div className="task-assignees">
                                                                        <small>Assigned: </small>
                                                                        {task.assignees && task.assignees.length > 0 ? (
                                                                            task.assignees.map(u => (
                                                                                <span key={u._id} className="assignee-badge" title={u.name}>
                                                                                    {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                                                                                </span>
                                                                            ))
                                                                        ) : (
                                                                            <span className="no-assignee">-</span>
                                                                        )}
                                                                        <select
                                                                            className="assign-dropdown"
                                                                            onChange={(e) => assignUser(task._id, e.target.value)}
                                                                            value=""
                                                                        >
                                                                            <option value="" disabled>+</option>
                                                                            {users.map(user => (
                                                                                <option key={user._id} value={user._id}>
                                                                                    {user.name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                {provided.placeholder}
                                            </div>
                                            {list.currentPage < list.totalPages && (
                                                <button
                                                    className="load-more-btn"
                                                    onClick={() => loadMoreTasks(list._id, list.currentPage + 1)}
                                                >
                                                    Load More
                                                </button>
                                            )}
                                            <div className="create-task">
                                                <input
                                                    type="text"
                                                    placeholder="New Task"
                                                    value={newTaskTitles[list._id] || ''}
                                                    onChange={(e) => setNewTaskTitles({ ...newTaskTitles, [list._id]: e.target.value })}
                                                />
                                                <button onClick={() => createTask(list._id)}>+</button>
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
                {showHistory && (
                    <div className="activity-sidebar">
                        <h3>Activity Log</h3>
                        <button onClick={clearHistory} className="clear-history-btn" style={{ marginBottom: '10px', fontSize: '12px', padding: '5px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Clear History
                        </button>
                        <div className="history-list">
                            {history.map(item => (
                                <div key={item._id} className="history-item">
                                    <strong>{item.user ? item.user.name : 'Unknown'}</strong> {item.description}
                                    <br />
                                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
export default BoardView;
