const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({

    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        Required: true
    },
    content:{
        type: String,
        Required: true,
    },
    caption: String,
    video: String,
    image: Buffer,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",

        }
    ],
    Comment:[
        {
            user: mongoose.Schema.Types.ObjectId,
            Text: String,
        }
    ],

});

  const Post = mongoose.model('post',postSchema);

  module.exports = Post;