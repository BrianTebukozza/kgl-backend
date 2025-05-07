const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
productSold: { type: String, required: true, trim: true},
quantity: { type: Number, required: true},
totalAmount: { type: Number, required: true},
buyerName: { type: String, required: true, trim: true},
agentName: { type: String, required: true, trim: true},
saleDateTime: { type: Date, required: true},
branch: { type: String, required: true, trim: true},
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Sale', saleSchema, 'sale');