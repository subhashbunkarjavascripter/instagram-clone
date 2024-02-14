const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     required: true
     },
  message: String,
  timestamp: {
     type: Date,
     default: Date.now
     },
  isRead: { 
     type: Boolean,
     default: false
     },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
