const express = require('express');
const cors = require('cors');
require('dotenv').config();

const recommendationRoutes = require('./routes/recommendations');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

console.log(`🚀 Backend Server Starting`);
console.log(`📍 ML Service URL: ${ML_SERVICE_URL}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    timestamp: new Date()
  });
});

// Recommendation API routes
app.use('/api/recommendations', recommendationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📡 ML Service connected to: ${ML_SERVICE_URL}`);
});
