const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { startMongo } = require('./config/db');
const { getLogs } = require('./logs/attackLog');

const sqlRoutes = require('./routes/sqlRoutes');
const nosqlRoutes = require('./routes/nosqlRoutes');

const app = express();

// Initialize MongoDB Memory Server
startMongo();

// Middlewares
app.use(cors());
app.use(morgan('dev'));

// CRITICAL: Both body parsers must be present
// express.json() is required for NoSQL injection object parsing
app.use(express.json()); 
// express.urlencoded is used for standard HTML forms (though we use fetch with JSON in this app, it's good practice)
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/sql', sqlRoutes);
app.use('/nosql', nosqlRoutes);

// Attack logs endpoint
app.get('/logs', (req, res) => {
  res.json(getLogs());
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 VulnAuthLab Server running on http://localhost:${PORT}`);
});
