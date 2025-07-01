const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema for the generated daily tasks
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: { type: String, required: true },
    link: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    dayOfWeek: { type: Number, required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeeklyTask' }
});

// Schema for the weekly task templates
const weeklyTaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    link: { type: String, default: '' },
    automate: { type: Boolean, default: false },
    preferredSlots: [String],
    startTime: { type: Number, default: null } 
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    githubUrl: { type: String, trim: true },
    reward: { type: String, default: 'Enjoy 2 hours of guilt-free fun!' },
    dayStartTime: { type: Number, default: 9 },
    dayEndTime: { type: Number, default: 21 },
    tasks: [taskSchema],
    weeklyTasks: [weeklyTaskSchema]
}, { timestamps: true });

// User model methods remain the same...
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
