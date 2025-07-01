const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/tasks
// @desc    Create a new task for the logged-in user
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, time } = req.body;
        if (!title || !time) {
            return res.status(400).json({ msg: 'Please provide a title and time for the task.' });
        }

        const user = await User.findById(req.user.id);
        
        const newTask = { title, time };
        user.tasks.push(newTask);
        
        await user.save();
        res.status(201).json(user.tasks);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/tasks/:taskId/toggle
// @desc    Toggle a task's completion status
router.put('/:taskId/toggle', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const task = user.tasks.id(req.params.taskId);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        task.completed = !task.completed;
        await user.save();
        res.json(user.tasks);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/tasks/:taskId
// @desc    Delete a task
router.delete('/:taskId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Pull the task out of the array
        user.tasks.pull({ _id: req.params.taskId });

        await user.save();
        res.json(user.tasks);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
