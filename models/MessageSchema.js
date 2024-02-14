const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        Required: true
    },
    recevier:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        Required: true
    },
    Text:String,
    timestamp:{
        type: Date,
        default: Date.now,
    },
    isRead:{
        type: Boolean,
        default: false,
    }
});

const Message = mongoose.model('Message',messageSchema);


module.exports = Message;