const express = require('express');
const User = require('../models/User');
const DSAQuestion = require('../models/DSAQuestion');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ msg: 'Admin access required' });
    }
};

router.get('/', authMiddleware, async (req, res) => {
    try {
        const questions = await DSAQuestion.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, link, platform } = req.body;
        const newQuestion = new DSAQuestion({ title, link, platform });
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/solve', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const questionId = req.params.id;
        const isSolved = user.solvedDSA.includes(questionId);
        if (isSolved) {
            user.solvedDSA.pull(questionId);
        } else {
            user.solvedDSA.push(questionId);
        }
        await user.save();
        res.json(user.solvedDSA);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/comment', authMiddleware, async (req, res) => {
    try {
        const question = await DSAQuestion.findById(req.params.id);
        const newComment = {
            user: req.user.id,
            username: req.user.username,
            text: req.body.text
        };
        question.comments.unshift(newComment);
        await question.save();
        res.status(201).json(question.comments);
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
