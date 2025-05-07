const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true, trim: true},

},
    {
        timestamps: true,
    }
)
module.exports = mongoose.model('Branch', branchSchema, 'branch');