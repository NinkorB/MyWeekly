const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register route (updated to return empty tasks array)
router.post('/register', async (req, res) => {
    const { username, password, githubUrl } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ msg: 'User already exists' });

        const user = await User.create({ username, password, githubUrl });

        if (user) {
            const token = generateToken(user._id);
            res.status(201).json({
                token,
                user: {
                    username: user.username,
                    githubUrl: user.githubUrl,
                    tasks: user.tasks // Return tasks array
                }
            });
        }
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// Login route (updated to return user's tasks)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            res.json({
                token,
                user: {
                    username: user.username,
                    githubUrl: user.githubUrl,
                    tasks: user.tasks // Return tasks array
                }
            });
        } else {
            res.status(401).json({ msg: 'Invalid credentials' });
        }
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// Verify route (updated to return tasks)
router.post('/verify', authMiddleware, async (req, res) => {
    res.json({
        token: req.token,
        user: {
            username: req.user.username,
            githubUrl: req.user.githubUrl,
            tasks: req.user.tasks // Return tasks array
        }
    });
});

module.exports = router;
