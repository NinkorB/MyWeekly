const express = require('express');
const User = require('../models/User');
const DSAQuestion = require('../models/DSAQuestion');
const Topic = require('../models/Topic'); // <-- Import the new model
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ msg: 'Admin access required' });
    }
};

// GET all data for the DSA sheet (ordered topics and questions)
router.get('/sheet-data', authMiddleware, async (req, res) => {
    try {
        const topics = await Topic.find().sort({ order: 1 });
        const questions = await DSAQuestion.find().sort({ primaryTag: 1, order: 1 });
        res.json({ topics, questions });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// POST a new question
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, link, primaryTag, tags } = req.body;

        // Check if the topic exists, if not, create it
        const topicExists = await Topic.findOne({ name: primaryTag });
        if (!topicExists) {
            await Topic.create({ name: primaryTag });
        }
        
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

// POST to reorder topics
router.post('/topics/reorder', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { orderedTopics } = req.body; // Expects an array of topic names in the new order
        const updates = orderedTopics.map((topicName, index) => ({
            updateOne: {
                filter: { name: topicName },
                update: { $set: { order: index + 1 } }
            }
        }));
        await Topic.bulkWrite(updates);
        res.json({ msg: 'Topics reordered successfully' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});


// DELETE a question
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const questionToDelete = await DSAQuestion.findById(req.params.id);
        if (!questionToDelete) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        const { primaryTag, order } = questionToDelete;
        await DSAQuestion.findByIdAndDelete(req.params.id);

        // Re-order subsequent questions in the same topic
        await DSAQuestion.updateMany(
            { primaryTag: primaryTag, order: { $gt: order } },
            { $inc: { order: -1 } }
        );

        // If no questions are left for a topic, delete the topic
        const remainingQuestions = await DSAQuestion.countDocuments({ primaryTag });
        if (remainingQuestions === 0) {
            await Topic.deleteOne({ name: primaryTag });
        }

        await User.updateMany({}, { $pull: { solvedDSA: req.params.id } });
        
        res.json({ msg: 'Question deleted successfully' });
    } catch (err) { 
        res.status(500).json({ msg: err.message }); 
    }
});

// Other routes remain the same
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
