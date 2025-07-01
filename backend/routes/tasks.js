const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { scheduleWeeklyTasks } = require('../utils/scheduler');

const router = express.Router();

// @route   POST /api/tasks/weekly
// @desc    Create a new weekly task template and regenerate the week's schedule
router.post('/weekly', authMiddleware, async (req, res) => {
    try {
        const { title, duration, link, automate, preferredSlots, startTime } = req.body;
        const user = await User.findById(req.user.id);

        const newWeeklyTask = { title, duration, link, automate, preferredSlots, startTime };
        user.weeklyTasks.push(newWeeklyTask);

        user.tasks = scheduleWeeklyTasks(user.weeklyTasks, user);
        
        await user.save();
        res.status(201).json({ weeklyTasks: user.weeklyTasks, tasks: user.tasks });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/tasks/weekly/:templateId
// @desc    Delete a weekly task template and regenerate schedule
router.delete('/weekly/:templateId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        user.weeklyTasks.pull({ _id: req.params.templateId });
        user.tasks = scheduleWeeklyTasks(user.weeklyTasks, user);

        await user.save();
        res.json({ weeklyTasks: user.weeklyTasks, tasks: user.tasks });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/tasks/:taskId/toggle
// @desc    Toggle a daily task's completion status
router.put('/:taskId/toggle', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const task = user.tasks.id(req.params.taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        task.completed = !task.completed;
        await user.save();
        res.json(user.tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
