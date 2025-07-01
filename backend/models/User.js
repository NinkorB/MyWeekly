const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define a schema for individual tasks
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    githubUrl: { type: String, trim: true },
    // Each user now has an array of their own tasks
    tasks: [taskSchema],
    // Progress is now calculated from tasks
    progress: { type: Map, of: Number, default: {} }
}, { timestamps: true });

// Hash password before saving (no change here)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
