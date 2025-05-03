const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
// const authRoutes = require('./routes/auth');
const produceRoutes = require('./routes/produce');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// app.use('/api/auth', authRoutes);
app.use('/api/produce', produceRoutes);

app.listen(8000, () => console.log('Server started on port 8000'));