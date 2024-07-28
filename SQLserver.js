const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const startTime = new Date();

app.use(cors());
app.use(express.json());

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || '34.174.158.123',
  user: process.env.DB_USER || 'remote',
  password: process.env.DB_PASSWORD || 'Password!*',
  database: process.env.DB_NAME || 'imgsearchdb'
});

let dbConnected = false;

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('MySQL connected...');
    dbConnected = true;
  }
});

const lastRequestTimestamps = {};

// Middleware to check request rate
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (lastRequestTtimestamps[ip] && now - lastRequestTimestamps[ip] < 3000) {
    return res.status(429).send('Too many requests. Please wait a few seconds before trying again.');
  }

  lastRequestTimestamps[ip] = now;
  next();
};

// Root route to display server status
app.get('/', (req, res) => {
  const currentTime = new Date();
  const uptime = Math.floor((currentTime - startTime) / 1000); // uptime in seconds
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;

  const statusMessage = dbConnected
    ? `Server is connected to the SQL database. Uptime: ${formattedUptime}.`
    : `Server is not connected to the SQL database. Uptime: ${formattedUptime}.`;

  res.send(statusMessage);
});

// Get thumbnails
app.get('/thumbnails', (req, res) => {
  const sql = 'SELECT * FROM thumbnails';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get image by ID
app.get('/images/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM images WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// Update view count
app.patch('/images/:id/views', rateLimiter, (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE images SET views = views + 1 WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// Update likes or dislikes
app.patch('/images/:id/:action', (req, res) => {
  const { id, action } = req.params;
  if (action !== 'likes' && action !== 'dislikes') {
    return res.status(400).send('Invalid action');
  }
  const sql = `UPDATE images SET ${action} = ${action} + 1 WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// Function to convert timestamp to MySQL format
const convertTimestampToMySQL = (timestamp) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

// Upload image and thumbnail
app.post('/upload', (req, res) => {
  const { name, nickname, tags, url, timestamp, thumbnailUrl } = req.body;
  const tagsStr = tags.join(',');

  const formattedTimestamp = convertTimestampToMySQL(timestamp);

  const sqlImage = 'INSERT INTO images (url, name, tags, timestamp, nickname, tag) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sqlImage, [url, name, JSON.stringify(tagsStr.split(",")), formattedTimestamp, nickname, tagsStr], (err, result) => {
    if (err) {
      console.error('Error inserting image:', err);
      return res.status(500).send('Error inserting image');
    }
    const imageId = result.insertId;

    const sqlThumbnail = 'INSERT INTO thumbnails (url, name, tags, timestamp, nickname) VALUES (?, ?, ?, ?, ?)';
    db.query(sqlThumbnail, [thumbnailUrl, name, JSON.stringify(tagsStr.split(",")), formattedTimestamp, nickname], (err, result) => {
      if (err) {
        console.error('Error inserting thumbnail:', err);
        return res.status(500).send('Error inserting thumbnail');
      }
      res.json({ imageId });
    });
  });
});

// Get comments by image ID
app.get('/comments', (req, res) => {
  const { imageId } = req.query;
  const sql = 'SELECT * FROM comments WHERE imageId = ?';
  db.query(sql, [imageId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Post comment
app.post('/comments', (req, res) => {
  const { imageId, nickname, comment } = req.body;
  const timestamp = convertTimestampToMySQL(new Date().toISOString());
  const sql = 'INSERT INTO comments (imageId, nickname, comment, timestamp) VALUES (?, ?, ?, ?)';
  db.query(sql, [imageId, nickname, comment, timestamp], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
