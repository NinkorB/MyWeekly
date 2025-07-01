const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register route (no change needed)
router.post('/register', async (req, res) => {
    // ...
});

// Login route (updated to return all user data)
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

// Verify route (updated to return all user data)
router.post('/verify', authMiddleware, async (req, res) => {
    res.json({ token: req.token, user: req.user.toObject() });
});

// Update Reward route (no change needed)
router.put('/reward', authMiddleware, async (req, res) => {
    // ...
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
