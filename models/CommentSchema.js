const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        Required:true,
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
        Required: true,
    },
    Text:String,

});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;