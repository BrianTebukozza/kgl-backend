const express = require('express');
const router = express.Router(); 
const CreditSale = require('../models/CreditSale'); 

router.post('/', async (req, res) => {
  const newCreditSale = new CreditSale({
    buyerName: req.body.buyerName,
    buyerNIN: req.body.buyerNIN,
    buyerLocation: req.body.buyerLocation,
    buyerPhone: req.body.buyerPhone,
    amountDue: req.body.amountDue,
    agentName: req.body.agentName,
    paymentDueDate: req.body.paymentDueDate,
    productSold: req.body.productSold,
    produceType: req.body.produceType,
    quantity: req.body.quantity,
    saleDateTime: req.body.saleDateTime,
    notes: req.body.notes
   
  });

  try {
   
    const savedCreditSale = await newCreditSale.save();
    
    res.status(201).json(savedCreditSale);
  } catch (err) {
   
    console.error('Error recording credit sale:', err);
   
    if (err.name === 'ValidationError') {
        res.status(400).json({ message: err.message });
    } else if (err.code === 11000) { 
         res.status(400).json({ message: `A credit sale record with NIN '${req.body.buyerNIN}' already exists.` });
    }
    else {
        res.status(500).json({ message: 'Failed to record credit sale', error: err.message });
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const creditSales = await CreditSale.find().sort({ saleDateTime: -1 });
    res.status(200).json(creditSales);
  } catch (err) {
    console.error('Error fetching credit sales:', err);
    res.status(500).json({ message: 'Failed to fetch credit sales', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const creditSale = await CreditSale.findById(req.params.id);
    if (!creditSale) {
      return res.status(404).json({ message: 'Credit sale record not found' });
    }
    res.status(200).json(creditSale);
  } catch (err) {
    console.error(`Error fetching credit sale with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Failed to fetch credit sale', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedCreditSale = await CreditSale.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCreditSale) {
      return res.status(404).json({ message: 'Credit sale record not found' });
    }

    res.status(200).json(updatedCreditSale);
  } catch (err) {
    console.error(`Error updating credit sale with ID ${req.params.id}:`, err);
     if (err.name === 'ValidationError') {
        res.status(400).json({ message: err.message });
    } else if (err.code === 11000) {
         res.status(400).json({ message: `A credit sale record with NIN '${req.body.buyerNIN}' already exists.` });
    }
    else {
        res.status(500).json({ message: 'Failed to update credit sale', error: err.message });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCreditSale = await CreditSale.findByIdAndDelete(req.params.id);

    if (!deletedCreditSale) {
      return res.status(404).json({ message: 'Credit sale record not found' });
    }

    res.status(200).json({ message: 'Credit sale record deleted successfully', deletedCreditSale });
  } catch (err) {
    console.error(`Error deleting credit sale with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Failed to delete credit sale', error: err.message });
  }
});

module.exports = router;
