const mongoose = require('mongoose');

const timeUsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity: String, 
  startTime: { type: Date, required: true },
  endTime: { type: Date }, 
});

const TimeUsage = mongoose.model('TimeUsage', timeUsageSchema);

module.exports = TimeUsage;
