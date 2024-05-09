import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoute.js';
import productRouter from './routes/productRoute.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoute.js';
import  path from 'path'

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Enable CORS globally 

app.use(cors({
  origin: function (origin, callback) {
   
    if (!origin || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept'
}));


app.get('/', (req, res) => {
  res.send('Server is running...')
})

// Routes
app.get('/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use('/seed', seedRouter);
app.use('/products', productRouter);
app.use('/users', userRouter);
app.use('/orders', orderRouter);


app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
