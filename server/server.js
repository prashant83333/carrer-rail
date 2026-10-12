require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const prepRoutes = require('./routes/prepRoutes');
const noteRoutes = require('./routes/noteRoutes');
const quizRoutes = require('./routes/quizRoutes');
const codingRoutes = require('./routes/codingRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the frontend (static HTML/CSS/JS) so the whole app runs from one server
app.use(express.static(path.join(__dirname, '..', 'client')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/prep', prepRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/coding', codingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Fallback to index.html for any non-API route (simple multi-page site, so just 404 for unknowns)
app.use((req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ message: 'Route not found' });
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another running process.`);
    console.error(`💡 Run this in PowerShell to free it: Stop-Process -Name node -Force\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
