  const mongoose = require('mongoose');

  var plm = require('passport-Local-Mongoose')

  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      Required: true,
      unique: true,
    },
    email: {
      type: String,
      Required: true,
      unique: true,
    },
    password: {
      type: String,
      Required: true,
    },
    fullname:{
      type: String,
      Required: true
    },
    posts:[{
      type: mongoose.Schema.Types.ObjectId,
      ref:"post"
    }],

    image:{
      type: String,
      default: 'def.png'
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    followers:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    following:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
      }
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],

  });


  userSchema.plugin(plm);


  const User = mongoose.model('User', userSchema);

  module.exports = User;
