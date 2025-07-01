const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { scheduleWeeklyTasks } = require('../utils/scheduler'); // <-- THE FIX IS HERE

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { username, password, githubUrl } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ msg: 'User already exists' });

        const user = await User.create({ username, password, githubUrl });

        if (user) {
            const token = generateToken(user._id);
            res.status(201).json({ token, user: user.toObject() });
        }
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            res.json({ token, user: user.toObject() });
        } else {
            res.status(401).json({ msg: 'Invalid credentials' });
        }
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// @route   POST /api/auth/verify
// @desc    Verify token and return user data
router.post('/verify', authMiddleware, async (req, res) => {
    res.json({ token: req.token, user: req.user.toObject() });
});

// @route   PUT /api/auth/reward
// @desc    Update the user's weekly reward
router.put('/reward', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.reward = req.body.reward || user.reward;
            const updatedUser = await user.save();
            res.json({ reward: updatedUser.reward });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT /api/auth/settings
// @desc    Update the user's day schedule settings
router.put('/settings', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.dayStartTime = req.body.dayStartTime ?? user.dayStartTime;
            user.dayEndTime = req.body.dayEndTime ?? user.dayEndTime;
            
            // Regenerate schedule with new settings
            user.tasks = scheduleWeeklyTasks(user.weeklyTasks, user);

            const updatedUser = await user.save();
            res.json({
                dayStartTime: updatedUser.dayStartTime,
                dayEndTime: updatedUser.dayEndTime,
                tasks: updatedUser.tasks
            });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
