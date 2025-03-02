const express = require('express');
const path = require('path');

const app = express();
const port = 5000;

// Serve the frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Fallback to index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});