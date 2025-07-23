const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    order: { type: Number, required: true, default: 0 }
});

topicSchema.pre('save', async function(next) {
    if (this.isNew) {
        const highestOrderTopic = await this.constructor.findOne().sort('-order');
        this.order = highestOrderTopic ? highestOrderTopic.order + 1 : 1;
    }
    next();
});

const Topic = mongoose.model('Topic', topicSchema);
module.exports = Topic;
