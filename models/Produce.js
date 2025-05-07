const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
    produceName: { type: String, required: true, trim: true},
    produceType: { type: String,required: true, trim: true},
    dateTime: { type: Date, required: true},
    tonnage: { type: Number, required: true},
    cost: { type: Number, required: true},
    dealerName: { type: String, required: true, trim: true},
    branch: { type: String, required: true, enum: ['Maganjo', 'Matugga']},
    contact: { type: String, required: true, trim: true },
    salePrice: {type: Number, required: true},

},
    {
        timestamps: true, 
    }
);

module.exports = mongoose.model('Produce', produceSchema);