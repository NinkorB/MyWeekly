const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, password, githubUrl } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const user = await User.create({ username, password, githubUrl });

        if (user) {
            const token = generateToken(user._id);
            res.status(201).json({
                token,
                user: {
                    username: user.username,
                    githubUrl: user.githubUrl,
                    progress: user.progress
                }
            });
        }
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST /api/auth/login
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
                    progress: user.progress
                }
            });
        } else {
            res.status(401).json({ msg: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST /api/auth/verify
router.post('/verify', authMiddleware, async (req, res) => {
    // If the middleware passes, the user is authenticated.
    // We send back the user data to re-populate the front-end state.
    res.json({
        token: req.token,
        user: {
            username: req.user.username,
            githubUrl: req.user.githubUrl,
            progress: req.user.progress
        }
    });
});

module.exports = router;
