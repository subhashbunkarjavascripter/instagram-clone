const mongoose = require('mongoose');

const languagePreferenceSchema = new mongoose.Schema({
  user: {  
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     required: true 
    },
  language: { 
    type: String,
     required: true
     },
});

const Language = mongoose.model('Language', languagePreferenceSchema);

module.exports = Language;
