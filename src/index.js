import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { init as schedulerInit } from './utils/scheduler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tiffinRoutes from './routes/tiffinRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
connectDB();
const app = express();
app.use(express.json());

// Start scheduler
schedulerInit();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tiffins', tiffinRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
