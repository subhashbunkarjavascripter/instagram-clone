const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    user: {
         type: mongoose.Schema.Types.ObjectId,
         ref:'User',
         Required: true,
    },
    video: String,
    caption: String,
    LIkes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
        
        }
    ],
    comment:[
        {
            user:mongoose.Schema.Types.ObjectId,
            Text:String,
        }
    ],
    createdAt:{
        type: Date,
        default:Date.now,
    }
});

const Reel =mongoose.model('Reel',reelSchema);

module.exports = Reel;