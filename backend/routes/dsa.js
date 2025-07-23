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
        const questions = await DSAQuestion.find().sort({ primaryTag: 1, order: 1 });
        res.json(questions);
    } catch (err) { 
        res.status(500).json({ msg: err.message }); 
    }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, link, primaryTag, tags } = req.body;
        
        const lastQuestion = await DSAQuestion.findOne({ primaryTag }).sort({ order: -1 });
        const newOrder = lastQuestion ? lastQuestion.order + 1 : 1;

        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        if (!tagsArray.includes(primaryTag)) {
            tagsArray.unshift(primaryTag);
        }

        const newQuestion = new DSAQuestion({ 
            title, 
            link, 
            primaryTag, 
            tags: tagsArray,
            order: newOrder
        });
        
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) { 
        res.status(500).json({ msg: err.message }); 
    }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const questionToDelete = await DSAQuestion.findById(req.params.id);
        if (!questionToDelete) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        await DSAQuestion.findByIdAndDelete(req.params.id);

        await DSAQuestion.updateMany(
            { primaryTag: questionToDelete.primaryTag, order: { $gt: questionToDelete.order } },
            { $inc: { order: -1 } }
        );

        await User.updateMany({}, { $pull: { solvedDSA: req.params.id } });
        
        res.json({ msg: 'Question deleted and list re-ordered' });
    } catch (err) { 
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
        res.status(500).json({ msg: err.message }); 
    }
});

module.exports = router;
