const mongoose = require('mongoose');

const creditSaleSchema = new mongoose.Schema({
    buyerName: { type: String, required: true, trim: true },
    buyerNIN: { type: String, required: true, unique: true, trim: true },
    buyerLocation: { type: String, required: false, trim: true },
    buyerPhone: { type: String, required: true, trim: true },
    amountDue: { type: Number, required: true, min: 0 },
    agentName: { type: String, required: true, trim: true },
    paymentDueDate: { type: Date, required: true },
    productSold: { type: String, required: true },
    quantity: { type: Number, required: true },
    saleDateTime: { type: Date, required: true },
    notes: { type: String, required: false, trim: true },
},
    {
        timestamps: true, 
    }
);

module.exports = mongoose.model('CreditSale', creditSaleSchema, 'credit_sale');