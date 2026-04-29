import express from 'express';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import QuizRoutes from './routes/quizRoutes.js';

//ES6 module _dirname alternative

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const NODE_ENV = process.env.NODE_ENV || 'development';
//Initializes express app

const app = express();

//connect to mongodb
connectDB();

 //middleware to handle CORS
 app.use(
  cors({
    origin:"*",
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
    credentials:true
  })
);
app.use(express.json());
app.use(express.urlencoded({extended:true}));


//static folder for upload
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

//routes
app.use('/api/auth', authRoutes);
app.use('/api/documents',documentRoutes);
app.use('/api/flashcards',flashcardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', QuizRoutes);

// basic health route until feature routes are wired
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

//404 handler

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404,
  });
});

// error handler
app.use(errorHandler);
//start server

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:',err.message);
  process.exit(1);
});
