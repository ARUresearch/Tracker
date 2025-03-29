const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    sampleSize: {
        type: Number,
        required: true
    },
    sampleAchieved: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Project', projectSchema);