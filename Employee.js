const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    workStart: {
        type: String,
        default: null
    },
    workEnd: {
        type: String,
        default: null
    },
    tasksCompleted: {
        type: Number,
        default: 0
    },
    dailyEarnings: {
        type: Number,
        default: 0
    },
    incentives: {
        type: Number,
        default: 0
    },
    advances: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Employee', employeeSchema);