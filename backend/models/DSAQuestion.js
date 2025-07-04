const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true }
}, { timestamps: true });

const dsaQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true, unique: true },
    platform: { type: String, default: 'LeetCode' },
    tags: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
    comments: [commentSchema]
}, { timestamps: true });

dsaQuestionSchema.pre('save', async function(next) {
    if (this.isNew) {
        const highestOrder = await this.constructor.findOne().sort('-order');
        this.order = (highestOrder && highestOrder.order) ? highestOrder.order + 1 : 1;
    }
    next();
});

const DSAQuestion = mongoose.model('DSAQuestion', dsaQuestionSchema);
module.exports = DSAQuestion;

