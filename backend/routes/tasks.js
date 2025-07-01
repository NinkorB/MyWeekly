const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { scheduleWeeklyTasks, getStartOfWeek } = require('../utils/scheduler'); // <-- ADDED getStartOfWeek

const router = express.Router();

// --- WEEKLY TASK TEMPLATE ROUTES ---
router.post('/weekly', authMiddleware, async (req, res) => {
    try {
        const { title, duration, link, automate, preferredSlots, startTime } = req.body;
        const user = await User.findById(req.user.id);

        const newWeeklyTask = { title, duration, link, automate, preferredSlots, startTime };
        user.weeklyTasks.push(newWeeklyTask);

        user.tasks = scheduleWeeklyTasks(user.weeklyTasks, user);
        
        await user.save();
        res.status(201).json({ weeklyTasks: user.weeklyTasks, tasks: user.tasks });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/weekly/:templateId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.weeklyTasks.pull({ _id: req.params.templateId });
        user.tasks = scheduleWeeklyTasks(user.weeklyTasks, user);
        await user.save();
        res.json({ weeklyTasks: user.weeklyTasks, tasks: user.tasks });
    } catch (err) { res.status(500).send('Server Error'); }
});

// --- DAILY TASK ROUTES ---
router.put('/:taskId/toggle', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const task = user.tasks.id(req.params.taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        
        task.completed = !task.completed;
        
        // --- NEW: Check and update weekly goal on task completion ---
        const startOfWeek = getStartOfWeek(new Date());
        let weekLog = user.history.find(log => {
            const logDate = new Date(log.weekOf);
            return logDate.getFullYear() === startOfWeek.getFullYear() &&
                   logDate.getMonth() === startOfWeek.getMonth() &&
                   logDate.getDate() === startOfWeek.getDate();
        });
        
        const completedTasks = user.tasks.filter(t => t.completed).length;
        const totalTasks = user.tasks.length;
        const goalMet = totalTasks > 0 && (completedTasks / totalTasks) >= 0.9;

        if (weekLog) {
            weekLog.tasksCompleted = completedTasks;
            weekLog.goalAchieved = goalMet;
        } else if (user.tasks.length > 0) {
            user.history.push({
                weekOf: startOfWeek,
                goalAchieved: goalMet,
                tasksCompleted: completedTasks,
                totalTasks: totalTasks
            });
        }
        
        await user.save();
        res.json({ tasks: user.tasks, history: user.history });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
