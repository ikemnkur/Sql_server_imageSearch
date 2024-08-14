const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // Add axios for making HTTP requests
const app = express();
const port = process.env.PORT || 5000;
const startTime = new Date();
const hostname = '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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


// Middleware to check request rate
const lastRequestTimestamps = {};

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (lastRequestTimestamps[ip] && now - lastRequestTimestamps[ip] < 3000) {
    return res.status(429).send('Too many requests. Please wait a few seconds before trying again.');
  }

  // Log the visit to the SQL database
  const imageId = req.params.id;
  const nickname = req.params.nickname;
  logVisitToDatabase(ip, imageId, nickname);

  lastRequestTimestamps[ip] = now;
  next();
};

// Function to log visits to the SQL database
const logVisitToDatabase = async (ip, imageId, nickname) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  const formattedTime = currentDate.toTimeString().split(' ')[0];

  try {
    // Fetch location data using ip-api
    const response = await axios.get(`ip-api.com/json`);
    const { country, regionName, city, lat, lon } = response.data;

    const sql = `
      INSERT INTO logs (image_id, nickname, ip, visit_date, visit_time, country, region, city, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [imageId, nickname, ip, formattedDate, formattedTime, country, regionName, city, lat, lon], (err, result) => {
      if (err) {
        console.error('Error inserting log into database:', err);
      } else {
        console.log(`Logged visit: IP ${ip} visited Image#${imageId} from ${city}, ${regionName}, ${country}`);
      }
    });
  } catch (error) {
    console.error('Error fetching GeoIP data:', error);
    // Log without location data if the GeoIP lookup fails
    const fallbackSql = `
      INSERT INTO logs (image_id, ip, visit_date, visit_time)
      VALUES (?, ?, ?, ?)
    `;
    db.query(fallbackSql, [imageId, ip, formattedDate, formattedTime], (err, result) => {
      if (err) {
        console.error('Error inserting fallback log into database:', err);
      } else {
        console.log(`Logged visit: IP ${ip} visited Image#${imageId} (Location unknown)`);
      }
    });
  }
};

// Endpoint to get visit logs
app.get('/logs', (req, res) => {
  const sql = "SELECT image_id, nickname, ip, visit_date, visit_time, country, region, city, latitude, longitude FROM logs";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving logs:', err);
      return res.status(500).send('Error retrieving logs');
    }
    res.json(results);
  });
});

// Root route to serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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


// Update view count and log the nickname
app.post('/images/:id/views', rateLimiter, (req, res) => {
  const { id } = req.params;
  const { nickname } = req.body;

  if (!id) {
    return res.status(400).send('Image ID is required');
  }

  if (!nickname) {
    return res.status(400).send('Nickname is required');
  }

  // Update the views count for the image
  const sqlUpdateViews = 'UPDATE images SET views = views + 1 WHERE id = ?';

  db.query(sqlUpdateViews, [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Image not found');
    }

    // Log the view along with the nickname
    const sqlLogView = `
      INSERT INTO logs (image_id, nickname, ip, visit_date, visit_time)
      VALUES (?, ?, ?, ?, ?)
    `;

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const formattedTime = currentDate.toTimeString().split(' ')[0];

    db.query(sqlLogView, [id, nickname, req.ip, formattedDate, formattedTime], (err, result) => {
      if (err) {
        console.error('Error logging view into database:', err);
        return res.status(500).send('Internal Server Error');
      }

      res.status(200).send({ message: 'Views updated and logged successfully' });
    });
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

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
