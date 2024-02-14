const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
  content: {
     type: mongoose.Schema.Types.ObjectId, 
     required: true 
    },
  contentType: String,
  timestamp: {
     type: Date, 
     default: Date.now
     }, 
});

const Share = mongoose.model('Share', shareSchema);

module.exports = Share;
