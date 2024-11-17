const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const Location = require('./models/Location'); // Import Location schema

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://vinayakjainlife:suddendeath123%40@cluster0.efw6gnu.mongodb.net/demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Multer Setup for File Uploads (Videos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/'); // Save videos in the 'videos' folder inside 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Add timestamp to filename to avoid collisions
  },
});

const upload = multer({ storage });

// Serve Static Files (Videos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes

// POST Route: Upload a video and location
app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { lat, lng } = req.body;

    // Ensure a video file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    // Create new location entry with video path
    const location = new Location({
      latitude: lat,
      longitude: lng,
      videoPath: req.file.path, // Save video path in the database
    });

    await location.save();

    res.status(201).json({ message: 'Location and video uploaded successfully', location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save location and video' });
  }
});

// GET Route: Fetch all locations (latitude, longitude, and videoPath)
app.get('/locations', async (req, res) => {
  try {
    // Fetch locations and include videoPath for reference
    const locations = await Location.find().select('latitude longitude videoPath');
    res.status(200).json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
