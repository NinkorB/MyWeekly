const express = require('express');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ msg: 'Admin access required' });
    }
};

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/password-requests', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const requests = await PasswordReset.find({ status: 'Pending' }).sort({ createdAt: 1 });
        res.json(requests);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/password-requests/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status, newPassword, adminResponse } = req.body;
        const request = await PasswordReset.findById(req.params.id);
        if (!request) return res.status(404).json({ msg: 'Request not found' });

        if (status === 'Approved' && newPassword) {
            const user = await User.findOne({ username: request.username });
            if (user) {
                user.password = newPassword;
                await user.save();
            }
            request.status = 'Approved';
            request.adminResponse = adminResponse || 'Your password has been reset.';
            request.newPassword = newPassword;
        } else {
            request.status = 'Rejected';
            request.adminResponse = adminResponse || 'Your request could not be verified.';
        }
        await request.save();
        res.json(request);
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
