const mongoose = require('mongoose');

const ProduceSchema = new mongoose.Schema({
    name: String,
    quantity: Number,

},
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    }
);

module.exports = mongoose.model('Produce', ProduceSchema);