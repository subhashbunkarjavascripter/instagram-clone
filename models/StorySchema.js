const mongoose = require('mongoose');


const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        Required: true
    },
    media: String,
    caption: String,
    Likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    Comment:[
        {
            type:mongoose.Schema.Types.ObjectId,
            Text:String,
        }
    ],
    viewers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            },
            type: {
                type: String,
                enum: ['viewed', 'seen'],
                default: 'viewed'
            }
        }
    ],
    createdAt:{
        type:Date,
        default: Date.now,
    },
    expiresAt: Date,
    isHidden:{
        type: Boolean,
        default: false,
    }
});

const Story = mongoose.model('Story',storySchema);

module.exports = Story;