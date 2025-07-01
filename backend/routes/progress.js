const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/progress/toggle
router.post('/toggle', authMiddleware, async (req, res) => {
    try {
        const { taskIndex } = req.body;
        const user = req.user; // User is attached from authMiddleware

        const today = new Date();
        const dateString = today.toISOString().split('T')[0];

        const currentCount = user.progress.get(dateString) || 0;

        // Simple toggle logic: if task is already marked, un-mark it and subsequent ones. Otherwise, mark it.
        if (currentCount > taskIndex) {
            user.progress.set(dateString, taskIndex);
        } else {
            user.progress.set(dateString, taskIndex + 1);
        }

        const updatedUser = await user.save();
        
        res.json({ progress: updatedUser.progress });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;

