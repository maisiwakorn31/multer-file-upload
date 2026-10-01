const express = require('express');
const fileRoutes = require('./routes/files');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
app.use(express.json());
app.use('/api/files', fileRoutes);
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler); // ต้องอยู่หยู่ ลังสุดสุ เสมอ
module.exports = app;