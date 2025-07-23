const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true }
}, { timestamps: true });

const dsaQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true, unique: true },
    primaryTag: { type: String, required: true, trim: true, index: true },
    tags: [{ type: String, trim: true }],
    order: { type: Number, required: true },
    comments: [commentSchema]
}, { timestamps: true });

const DSAQuestion = mongoose.model('DSAQuestion', dsaQuestionSchema);
module.exports = DSAQuestion;
