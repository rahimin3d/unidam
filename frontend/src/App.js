import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [option, setOption] = useState('keep_in_place');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleOptionChange = (e) => {
    setOption(e.target.value);
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
        },
      });
      alert(response.data);
    } catch (error) {
      console.error(error);
      alert('Error uploading file.');
    }
  };

  return (
    <div className="App">
      <h1>Digital Asset Management</h1>
      <form onSubmit={handleSubmit}>
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
    </div>
  );
}

export default App;