const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: { type: String, required: true },
    link: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    dayOfWeek: { type: Number, required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId }
});

const weeklyTaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    link: { type: String, default: '' },
    automate: { type: Boolean, default: false },
    preferredSlots: [String],
    startTime: { type: Number, default: null }
});

const weekLogSchema = new mongoose.Schema({
    weekOf: { type: Date, required: true },
    goalAchieved: { type: Boolean, required: true },
    tasksCompleted: { type: Number, required: true },
    totalTasks: { type: Number, required: true }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    githubUrl: { type: String, trim: true },
    reward: { type: String, default: 'Enjoy 2 hours of guilt-free fun!' },
    dayStartTime: { type: Number, default: 9 },
    dayEndTime: { type: Number, default: 21 },
    isAdmin: { type: Boolean, default: false },
    tasks: [taskSchema],
    weeklyTasks: [weeklyTaskSchema],
    history: [weekLogSchema],
    solvedDSA: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DSAQuestion' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.username === 'ninkor') {
        this.isAdmin = true;
    }
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

