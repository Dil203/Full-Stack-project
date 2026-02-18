import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [boards, setBoards] = useState([]);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const res = await api.get('/boards');
            setBoards(res.data.boards);
        } catch (error) {
            console.error("Error fetching boards:", error);
            if (error.response && error.response.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const createBoard = async (e) => {
        e.preventDefault();
        if (!newBoardTitle) return;
        try {
            const res = await api.post('/boards', { title: newBoardTitle });
            setBoards([...boards, res.data.board]);
            setNewBoardTitle('');
        } catch (error) {
            console.error("Error creating board:", error);
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message); // Show backend error message
            }
        }
    };

    const deleteBoard = async (e, boardId) => {
        e.preventDefault(); // Prevent navigating
        e.stopPropagation(); // Stop bubbling
        if (!window.confirm("Are you sure you want to delete this board?")) return;
        try {
            await api.delete(`/boards/${boardId}`);
            setBoards(boards.filter(b => b._id !== boardId));
        } catch (error) {
            console.error("Error deleting board:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="header fade-in">
                <h1 className="hintro-brand">Hintro</h1>
                <div className="user-menu">
                    <div className="user-welcome">
                        <span className="welcome-text">Welcome back,</span>
                        <span className="user-name">{user?.name}</span>
                    </div>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="content">
                <div className="create-board-section">
                    <h3>Create New Board</h3>
                    <form onSubmit={createBoard} className="create-board-form">
                        <input
                            type="text"
                            placeholder="Board Title"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                        />
                        <button type="submit">Create</button>
                    </form>
                </div>

                <div className="board-grid">
                    {boards.map(board => (
                        <Link to={`/board/${board._id}`} key={board._id} className="board-card">
                            <h3>{board.title}</h3>
                            <button
                                className="delete-board-btn"
                                onClick={(e) => deleteBoard(e, board._id)}
                                title="Delete Board"
                            >
                                ×
                            </button>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};
export default Dashboard;
