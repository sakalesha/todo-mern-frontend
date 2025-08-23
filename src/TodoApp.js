import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import './App.css';
import VersionDisplay from './VersionDisplay';

function TodoApp() {
  const { user, logout } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all'); // all, completed, incomplete
  const [loading, setLoading] = useState(false);
  const [backendVersion, setBackendVersion] = useState('');

  // Axios instance with auth header
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: { Authorization: `Bearer ${user?.token}` },
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/todos');
      setTodos(res.data);
    } catch {
      toast.error('Could not fetch todos. Please try again.');
    }
    setLoading(false);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.warning('Todo cannot be empty.');
      return;
    }
    try {
      const res = await axiosInstance.post('/todos', { text: input });
      if (res.status === 201) {
        setInput('');
        fetchTodos();
        toast.info('Todo added successfully.');
      } else {
        toast.error('Could not add todo. Please try again.');
      }
    } catch {
      toast.error('Error adding todo. Please check your connection.');
    }
  };

  const startEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const handleEdit = (e) => setEditText(e.target.value);

  const submitEdit = async (id) => {
    if (!editText.trim()) {
      toast.warning('Todo cannot be empty.');
      return;
    }
    try {
      const res = await axiosInstance.put(`/todos/${id}`, { text: editText });
      if (res.status === 200) {
        setEditId(null);
        setEditText('');
        fetchTodos();
        toast.info('Todo updated successfully.');
      } else {
        toast.error('Could not update todo. Please try again.');
      }
    } catch {
      toast.error('Error updating todo. Please check your connection.');
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  const toggleCompleted = async (id) => {
    try {
      const res = await axiosInstance.patch(`/todos/${id}`);
      if (res.status === 200) {
        fetchTodos();
        toast.info('Todo marked as completed.');
      } else {
        toast.error('Could not toggle todo status. Please try again.');
      }
    } catch {
      toast.error('Error toggling todo. Please check your connection.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await axiosInstance.delete(`/todos/${id}`);
      if (res.status === 200) {
        fetchTodos();
        toast.info('Todo deleted successfully.');
      } else {
        toast.error('Could not delete todo. Please try again.');
      }
    } catch {
      toast.error('Error deleting todo. Please check your connection.');
    }
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/version`)
      .then(res => setBackendVersion(res.data.version))
      .catch(() => setBackendVersion('Unavailable'));
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>MERN Todo App</h1>
        <div>
          Logged in as <strong>{user.username}</strong>{' '}
          <button onClick={logout} style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={addTodo}>
        <input
          type="text"
          value={input}
          placeholder="Enter a todo..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {loading && <p>Loading...</p>}

      <div style={{ margin: "1rem 0" }}>
        <button
          onClick={() => setFilter('all')}
          disabled={filter === 'all'}
          style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('completed')}
          disabled={filter === 'completed'}
          style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('incomplete')}
          disabled={filter === 'incomplete'}
          style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}
        >
          Incomplete
        </button>
      </div>

      <ul>
        {todos
          .filter(
            (todo) =>
              filter === 'all' ||
              (filter === 'completed' && todo.completed) ||
              (filter === 'incomplete' && !todo.completed)
          )
          .map((todo) => (
            <li key={todo._id} className={todo.completed ? 'completed' : ''}>
              {editId === todo._id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={handleEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitEdit(todo._id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    onClick={() => submitEdit(todo._id)}
                    style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}
                  >
                    Save
                  </button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <span onClick={() => toggleCompleted(todo._id)} style={{ cursor: 'pointer' }}>
                    {todo.text}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8em',
                      color: '#666',
                      marginLeft: '1rem',
                    }}
                  >
                    {todo.createdAt && 'Created: ' + new Date(todo.createdAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => startEdit(todo._id, todo.text)}
                    style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteTodo(todo._id)}>Delete</button>
                </>
              )}
            </li>
          ))}
      </ul>

      <VersionDisplay />
    </div>
  );
}

export default TodoApp;