const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs'); // Import the fs module for file operations
const path = require('path'); // Import the path module to handle file paths
const app = express();
const port = process.env.PORT || 5000;
const startTime = new Date();
const hostname = '0.0.0.0';

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

// Object to store timestamps of last requests for rate limiting
const lastRequestTimestamps = {};

// Path to the JSON log file
const logFilePath = path.join(__dirname, 'visitLogs.json');

// Function to log visits to a JSON file
const logVisitToFile = (ip, imageId) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US');
  const formattedTime = currentDate.toLocaleTimeString('en-US');

  // Create a new log entry
  const logEntry = {
    date: formattedDate,
    time: formattedTime
  };

  // Read the existing log file
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    let logs;
    if (err) {
      // If the file does not exist, start with an empty object
      logs = {};
    } else {
      // Parse the existing JSON data
      logs = JSON.parse(data);
    }

    // Check if the image ID already exists in the logs
    if (!logs[`image#${imageId}`]) {
      logs[`image#${imageId}`] = {
        ip: ip,
        visits: []
      };
    }

    // Add the new log entry to the visits array
    logs[`image#${imageId}`].visits.push(logEntry);

    // Write the updated logs back to the file
    fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      } else {
        console.log(`Logged visit: IP ${ip} visited Image#${imageId}`);
      }
    });
  });
};

// Middleware to check request rate
const rateLimiter = (req, res, next) => {
  // Extract IP address from the request
  const ip = req.ip;

  // Get current timestamp
  const now = Date.now();

  // Check if the IP has made a recent request within 3 seconds
  if (lastRequestTimestamps[ip] && now - lastRequestTimestamps[ip] < 3000) {
    // Return a 429 response if too many requests are made
    return res.status(429).send('Too many requests. Please wait a few seconds before trying again.');
  }

  // Log the visit to the console and file
  const imageId = req.params.id; // Assuming the image ID is in the request params
  logVisitToFile(ip, imageId);

  // Update last request timestamp for the IP
  lastRequestTimestamps[ip] = now;

  // Continue to the next middleware function
  next();
};

// Endpoint to get visit logs
app.get('/logs', (req, res) => {
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err);
      return res.status(500).send('Error reading log file');
    }
    res.json(JSON.parse(data));
  });
});

// Root route to display server status and logs
app.get('/', (req, res) => {
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err);
      data = '{}'; // Default to empty object if there's an error
    }

    const currentTime = new Date();
    const uptime = Math.floor((currentTime - startTime) / 1000); // uptime in seconds
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;

    const statusMessage = dbConnected
      ? `Server is connected to the SQL database. Uptime: ${formattedUptime}.`
      : `Server is not connected to the SQL database. Uptime: ${formattedUptime}.`;

    // Serve the HTML page
    res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visit Logs</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ccc;
        }
        th {
            background-color: #eee;
        }
        input[type="text"] {
            padding: 8px;
            width: 200px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        select {
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            padding: 8px 12px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: #007bff;
            color: white;
            cursor: pointer;
        }
        button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Server Status</h1>
        <p id="statusMessage">${statusMessage}</p>
        <h2>Visit Logs</h2>
        <div>
            <h3>Image Views</h3>
            <input type="text" id="searchInputViews" placeholder="Search...">
            <select id="filterSelectViews">
                <option value="views">Views</option>
                <option value="imageId">Image ID</option>
            </select>
            <button onclick="sortLogsViews()">Sort</button>
            <table>
                <thead>
                    <tr>
                        <th>Image ID</th>
                        <th>Number of Views</th>
                    </tr>
                </thead>
                <tbody id="logTableBodyViews">
                    <!-- Log entries will be populated here -->
                </tbody>
            </table>
        </div>
        <div>
            <h3>Visit Details</h3>
            <input type="text" id="searchInput" placeholder="Search...">
            <select id="filterSelect">
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="ip">IP</option>
                <option value="imageId">Image ID</option>
            </select>
            <button onclick="sortLogs()">Sort</button>
            <table>
                <thead>
                    <tr>
                        <th>Image ID</th>
                        <th>IP</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody id="logTableBody">
                    <!-- Log entries will be populated here -->
                </tbody>
            </table>
        </div>
    </div>
    <script>
        // Function to load logs from the server
        function loadLogs() {
            fetch('/logs')
                .then(response => response.json())
                .then(logs => {
                    displayLogs(logs);
                    displayViewCounts(logs);
                })
                .catch(error => console.error('Error loading logs:', error));
        }

        // Function to display logs in the visit details table
        function displayLogs(logs) {
            const logTableBody = document.getElementById('logTableBody');
            logTableBody.innerHTML = ''; // Clear existing entries

            Object.entries(logs).forEach(([imageId, data]) => {
                data.visits.forEach(visit => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${imageId}</td>
                        <td>\${data.ip}</td>
                        <td>\${visit.date}</td>
                        <td>\${visit.time}</td>
                    \`;
                    logTableBody.appendChild(row);
                });
            });
        }

        // Function to display view counts in the image views table
        function displayViewCounts(logs) {
            const logTableBodyViews = document.getElementById('logTableBodyViews');
            logTableBodyViews.innerHTML = ''; // Clear existing entries

            Object.entries(logs).forEach(([imageId, data]) => {
                const row = document.createElement('tr');
                row.innerHTML = \`
                    <td>\${imageId}</td>
                    <td>\${data.visits.length}</td>
                \`;
                logTableBodyViews.appendChild(row);
            });
        }

        // Function to filter logs based on search input in visit details table
        function filterLogs() {
            const searchInput = document.getElementById('searchInput').value.toLowerCase();
            const logTableBody = document.getElementById('logTableBody');
            const rows = logTableBody.getElementsByTagName('tr');

            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                let match = false;

                for (let j = 0; j < cells.length; j++) {
                    if (cells[j].innerText.toLowerCase().includes(searchInput)) {
                        match = true;
                        break;
                    }
                }

                rows[i].style.display = match ? '' : 'none';
            }
        }

        // Function to filter logs based on search input in image views table
        function filterLogsViews() {
            const searchInputViews = document.getElementById('searchInputViews').value.toLowerCase();
            const logTableBodyViews = document.getElementById('logTableBodyViews');
            const rows = logTableBodyViews.getElementsByTagName('tr');

            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                let match = false;

                for (let j = 0; j < cells.length; j++) {
                    if (cells[j].innerText.toLowerCase().includes(searchInputViews)) {
                        match = true;
                        break;
                    }
                }

                rows[i].style.display = match ? '' : 'none';
            }
        }

        // Function to sort logs in visit details table
        function sortLogs() {
            const filterSelect = document.getElementById('filterSelect').value;
            const logTableBody = document.getElementById('logTableBody');
            const rows = Array.from(logTableBody.getElementsByTagName('tr'));

            rows.sort((a, b) => {
                const aText = a.getElementsByTagName('td')[filterSelect === 'imageId' ? 0 : filterSelect === 'ip' ? 1 : filterSelect === 'date' ? 2 : 3].innerText;
                const bText = b.getElementsByTagName('td')[filterSelect === 'imageId' ? 0 : filterSelect === 'ip' ? 1 : filterSelect === 'date' ? 2 : 3].innerText;

                if (filterSelect === 'date' || filterSelect === 'time') {
                    return new Date(aText) - new Date(bText);
                } else {
                    return aText.localeCompare(bText);
                }
            });

            // Re-attach sorted rows to the table
            logTableBody.innerHTML = '';
            rows.forEach(row => logTableBody.appendChild(row));
        }

        // Function to sort logs in image views table
        function sortLogsViews() {
            const filterSelectViews = document.getElementById('filterSelectViews').value;
            const logTableBodyViews = document.getElementById('logTableBodyViews');
            const rows = Array.from(logTableBodyViews.getElementsByTagName('tr'));

            rows.sort((a, b) => {
                const aText = a.getElementsByTagName('td')[filterSelectViews === 'imageId' ? 0 : 1].innerText;
                const bText = b.getElementsByTagName('td')[filterSelectViews === 'imageId' ? 0 : 1].innerText;

                if (filterSelectViews === 'views') {
                    return parseInt(bText) - parseInt(aText); // Sort views in descending order
                } else {
                    return aText.localeCompare(bText);
                }
            });

            // Re-attach sorted rows to the table
            logTableBodyViews.innerHTML = '';
            rows.forEach(row => logTableBodyViews.appendChild(row));
        }

        // Event listeners for search and sorting in visit details
        document.getElementById('searchInput').addEventListener('input', filterLogs);
        document.getElementById('filterSelect').addEventListener('change', sortLogs);

        // Event listeners for search and sorting in image views
        document.getElementById('searchInputViews').addEventListener('input', filterLogsViews);
        document.getElementById('filterSelectViews').addEventListener('change', sortLogsViews);

        // Load logs on page load
        window.onload = loadLogs;
    </script>
</body>
</html>

    `);
  });
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

// Update view count
app.post('/images/:id/views', rateLimiter, (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('Image ID is required');
  }

  const sql = 'UPDATE images SET views = views + 1 WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Image not found');
    }

    res.status(200).send({ message: 'Views updated successfully' });
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
