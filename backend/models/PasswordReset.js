const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    username: { type: String, required: true },
    fullName: { type: String, required: true },
    link: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, default: 'Pending' },
    adminResponse: { type: String, default: '' },
    newPassword: { type: String, default: '' }
}, { timestamps: true });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
module.exports = PasswordReset;
