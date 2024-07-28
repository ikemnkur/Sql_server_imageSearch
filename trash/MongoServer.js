const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/img_search', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('MongoDB connected...');
});

// Define schemas
const imageSchema = new mongoose.Schema({
  views: Number,
  url: String,
  name: String,
  tags: [String],
  timestamp: Date,
  nickname: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
});

const thumbnailSchema = new mongoose.Schema({
  url: String,
  name: String,
  tags: [String],
  timestamp: Date,
  nickname: String
});

const commentSchema = new mongoose.Schema({
  imageId: mongoose.Schema.Types.ObjectId,
  comment: String,
  nickname: String,
  timestamp: Date
});

// Define models
const Image = mongoose.model('Image', imageSchema);
const Thumbnail = mongoose.model('Thumbnail', thumbnailSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Get thumbnails
app.get('/thumbnails', async (req, res) => {
  try {
    const thumbnails = await Thumbnail.find();
    res.json(thumbnails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get image by ID
app.get('/images/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Image.findById(id);
    res.json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update view count
app.patch('/images/:id/views', async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Image.findById(id);
    if (image) {
      image.views += 1;
      await image.save();
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update likes or dislikes
app.patch('/images/:id/:action', async (req, res) => {
  const { id, action } = req.params;
  if (action !== 'likes' && action !== 'dislikes') {
    return res.status(400).send('Invalid action');
  }
  try {
    const image = await Image.findById(id);
    if (image) {
      image[action] += 1;
      await image.save();
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload image and thumbnail
app.post('/upload', async (req, res) => {
  const { name, nickname, tags, url, timestamp, thumbnailUrl } = req.body;
  const tagsArray = tags.split(',').map(tag => tag.trim());

  const image = new Image({
    url,
    name,
    tags: tagsArray,
    timestamp: new Date(timestamp),
    nickname
  });

  const thumbnail = new Thumbnail({
    url: thumbnailUrl,
    name,
    tags: tagsArray,
    timestamp: new Date(timestamp),
    nickname
  });

  try {
    const savedImage = await image.save();
    await thumbnail.save();
    res.json({ imageId: savedImage._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments by image ID
app.get('/comments', async (req, res) => {
  const { imageId } = req.query;
  try {
    const comments = await Comment.find({ imageId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a comment
app.post('/comments', async (req, res) => {
  const { imageId, nickname, comment, timestamp } = req.body;
  const newComment = new Comment({
    imageId,
    comment,
    nickname,
    timestamp: new Date(timestamp)
  });

  try {
    const savedComment = await newComment.save();
    res.json(savedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
