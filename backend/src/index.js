const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const port = 5000;

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

// Endpoint to upload files
app.post('/upload', upload.single('file'), async (req, res) => {
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

// Endpoint to list files
app.get('/files', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resources');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error fetching files.');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});