const mongoose =require('mongoose');

const highlightSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
        Required: true
    },
    content: {
        type: mongoose.Schema.Types.ObjectId,
        Required: true
    },
    contentType: String,
    color: String,
    notes: String,
});

const Highlight = mongoose.model('Highlight',highlightSchema);

module.exports = Highlight;

