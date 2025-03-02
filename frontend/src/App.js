import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [option, setOption] = useState('keep_in_place');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [adminView, setAdminView] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleOptionChange = (e) => {
    setOption(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setToken(response.data.token);
      setIsAuthenticated(true);
      setIsAdmin(response.data.token.isAdmin);
      alert('Login successful');
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('option', option);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token,
        },
      });
      alert(response.data);
    } catch (error) {
      console.error(error);
      alert('Error uploading file.');
    }
  };

  const handleAdminViewChange = async (view) => {
    setAdminView(view);
    try {
      const response = await axios.get(`http://localhost:5000/admin/${view}`, {
        headers: {
          'Authorization': token,
        },
      });
      alert(response.data);
    } catch (error) {
      console.error(error);
      alert(`Error fetching ${view}`);
    }
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <div>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">Login</button>
        </form>
      ) : (
        <div>
          <form onSubmit={handleSubmit}>
            <h1>Upload File</h1>
            <div>
              <label htmlFor="file">File:</label>
              <input type="file" id="file" onChange={handleFileChange} />
            </div>
            <div>
              <label htmlFor="option">Option:</label>
              <select id="option" value={option} onChange={handleOptionChange}>
                <option value="keep_in_place">Keep in place</option>
                <option value="add_to_database">Add to database</option>
              </select>
            </div>
            <button type="submit">Upload</button>
          </form>
          {isAdmin && (
            <div>
              <h2>Admin Section</h2>
              <button onClick={() => handleAdminViewChange('jobs')}>Manage Jobs</button>
              <button onClick={() => handleAdminViewChange('users')}>Manage Users</button>
              <button onClick={() => handleAdminViewChange('emails')}>Manage Emails</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;