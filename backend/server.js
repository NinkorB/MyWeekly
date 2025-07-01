require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://ninkorb.github.io'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected!')).catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

