import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file (optional but recommended)
dotenv.config();

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    // Use the MONGO_URI from .env (recommended) or directly provide the MongoDB URI
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://vinayakjainlife:suddendeath123%40@cluster0.efw6gnu.mongodb.net/ctf/user', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

// Connect to the database
connectDB();

// Sample Route (optional, just to verify the server is working)
app.get('/', (req, res) => {
  res.send('Hello, MongoDB connected!');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
