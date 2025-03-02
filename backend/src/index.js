const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const port = 5000;
const secretKey = 'your_secret_key';

// PostgreSQL setup
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Middleware for parsing JSON and form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Function to generate obfuscated path
const generateObfuscatedPath = (resourceId) => {
  const reverseId = resourceId.toString().split('').reverse().join('');
  const randomString = uuidv4().replace(/-/g, '').slice(0, 10);
  return path.join(...reverseId.split(''), `_${randomString}`);
};

// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password, isAdmin } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)', [username, hashedPassword, isAdmin]);
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).send('Invalid username or password');
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid username or password');
    }

    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send('Access denied');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};

// Middleware to authorize admin requests
const authorizeAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).send('Access denied');
  }
  next();
};

// Endpoint to upload files (authenticated)
app.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  const { file } = req;
  const { option } = req.body;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  if (option === 'add_to_database') {
    try {
      const resourceId = uuidv4();
      const obfuscatedPath = generateObfuscatedPath(resourceId);

      const destPath = path.join(__dirname, 'filestore', obfuscatedPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.renameSync(file.path, destPath);

      await pool.query('INSERT INTO resources (id, path, original_name) VALUES ($1, $2, $3)', [resourceId, destPath, file.originalname]);

      return res.status(200).send('File added to database.');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error adding file to database.');
    }
  } else {
    // Keep the file in place
    return res.status(200).send('File kept in place.');
  }
});

// Endpoint to list files (authenticated)
app.get('/files', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resources');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error fetching files.');
  }
});

// Admin endpoint to manage jobs (authorized)
app.get('/admin/jobs', authenticate, authorizeAdmin, async (req, res) => {
  // Placeholder for job management logic
  res.status(200).send('List of jobs');
});

// Admin endpoint to manage users (authorized)
app.get('/admin/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, is_admin, created_at FROM users');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error fetching users.');
  }
});

// Admin endpoint to manage emails (authorized)
app.get('/admin/emails', authenticate, authorizeAdmin, async (req, res) => {
  // Placeholder for email management logic
  res.status(200).send('List of emails');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});