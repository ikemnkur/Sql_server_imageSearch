const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// // MySQL database connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'img_search'
// });

// MySQL database connection
const db = mysql.createConnection({
  host: '34.174.158.123',
  user: 'remote',
  password: 'Password!*',
  database: 'imgsearchdb'
});

// // MySQL database connection
// const db = mysql.createConnection({
//   host: 'database-1.clu0wem405k1.us-east-1.rds.amazonaws.com',
//   user: 'admin',
//   password: 'Password!*1234',
//   database: 'img_search'
// });

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
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
app.patch('/images/:id/views', (req, res) => {
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
// Upload image and thumbnail
app.post('/upload', (req, res) => {
  const { name, nickname, tags, url, timestamp, thumbnailUrl } = req.body;
  const tagsStr = tags.join(',');

  const sqlImage = 'INSERT INTO images (url, name, tags, timestamp, nickname) VALUES (?, ?, ?, ?, ?)';
  db.query(sqlImage, [url, name, tagsStr, timestamp, nickname], (err, result) => {
    if (err) {
      console.error('Error inserting image:', err);
      return res.status(500).send('Error inserting image');
    }
    const imageId = result.insertId;

    const sqlThumbnail = 'INSERT INTO thumbnails (url, name, tags, timestamp, nickname) VALUES (?, ?, ?, ?, ?)';
    db.query(sqlThumbnail, [thumbnailUrl, name, tagsStr, timestamp, nickname], (err, result) => {
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


app.post('/comments', (req, res) => {
  const { imageId, nickname, comment } = req.body;
  const timestamp = new Date().toISOString(); // Ensure timestamp is in ISO 8601 format
  const sql = 'INSERT INTO comments (imageId, nickname, comment, timestamp) VALUES (?, ?, ?, ?)';
  db.query(sql, [imageId, nickname, comment, timestamp], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId });
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
