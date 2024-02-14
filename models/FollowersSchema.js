const mongoose = require('mongoose');

const followersSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        Required: true,
    },
    following:{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        Required: true,
    }
});

const Follower = mongoose.model('Follower',followersSchema);

module.exports = Follower;