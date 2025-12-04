import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';

// Initialize the express engine
const app: express.Application = express();

// Take a port from environment or default 3000
const port: number = parseInt(process.env.PORT || '3000');

// Middlewares
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/', (_req, _res) => {
  _res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((_req, _res) => {
  _res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Server setup
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}/`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});