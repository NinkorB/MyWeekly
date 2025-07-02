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
        const questions = await DSAQuestion.find().sort({ createdAt: 1 });
        res.json(questions);
    } catch (err) { 
        console.error("Error fetching DSA questions:", err);
        res.status(500).json({ msg: err.message }); 
    }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, link, platform, tags } = req.body;
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const newQuestion = new DSAQuestion({ title, link, platform, tags: tagsArray });
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) { 
        console.error("Error creating DSA question:", err);
        res.status(500).json({ msg: err.message }); 
    }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, link, tags } = req.body;
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const updatedQuestion = await DSAQuestion.findByIdAndUpdate(
            req.params.id,
            { title, link, tags: tagsArray },
            { new: true }
        );
        res.json(updatedQuestion);
    } catch (err) { 
        console.error("Error updating DSA question:", err);
        res.status(500).json({ msg: err.message }); 
    }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await DSAQuestion.findByIdAndDelete(req.params.id);
        await User.updateMany({}, { $pull: { solvedDSA: req.params.id } });
        res.json({ msg: 'Question deleted' });
    } catch (err) { 
        console.error("Error deleting DSA question:", err);
        res.status(500).json({ msg: err.message }); 
    }
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
    } catch (err) { 
        console.error("Error toggling DSA solve status:", err);
        res.status(500).json({ msg: err.message }); 
    }
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
    } catch (err) { 
        console.error("Error adding comment:", err);
        res.status(500).json({ msg: err.message }); 
    }
});

module.exports = router;
