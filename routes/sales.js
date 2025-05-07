const express = require('express');
const router = express.Router(); 
const Sale = require('../models/Sale'); 
const Produce = require('../models/Produce'); 

router.post('/', async (req, res) => {
  const { productSold, quantity, totalAmount, buyerName, agentName, saleDateTime, branch } = req.body;

  if (!productSold || quantity === undefined || quantity <= 0 || totalAmount === undefined || totalAmount < 0 || !buyerName || !agentName || !saleDateTime || !branch) {
    return res.status(400).json({ message: 'Required fields are missing or invalid.' });
  }

  try {
    const produce = await Produce.findOne({ produceName: productSold });

    if (!produce) {
      return res.status(404).json({ message: `Produce '${productSold}' not found in inventory.` });
    }

    if (produce.remainingTonnage < quantity) {
      console.warn(`Low stock alert: Sale attempted for ${quantity} kgs of ${productSold}, but only ${produce.remainingTonnage} kgs available.`);
      return res.status(409).json({ message: `Insufficient stock for ${productSold}. Only ${produce.remainingTonnage} kgs available.` });
    }

    const newSale = new Sale({
      productSold,
      quantity,
      totalAmount,
      buyerName,
      agentName,
      saleDateTime,
      branch,
    });

    const updatedProduce = await Produce.findByIdAndUpdate(
      produce._id,
      { $inc: { remainingTonnage: -quantity } }, 
      { new: true, runValidators: true } 
    );

    if (!updatedProduce) {
     
      throw new Error('Failed to update produce stock after stock check.');
    }

    const savedSale = await newSale.save();

    res.status(201).json(savedSale);

  } catch (err) {
    console.error('Error recording cash sale:', err);
    if (err.name === 'ValidationError') {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Failed to record cash sale', error: err.message });
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ saleDateTime: -1 });
    res.status(200).json(sales);
  } catch (err) {
    console.error('Error fetching cash sales:', err);
    res.status(500).json({ message: 'Failed to fetch cash sales', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
  
    if (!sale) {
      return res.status(404).json({ message: 'Cash sale record not found' });
    }
    
    res.status(200).json(sale);
  } catch (err) {
    console.error(`Error fetching cash sale with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Failed to fetch cash sale', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const saleId = req.params.id;
  const updateData = req.body;

  try {
    const originalSale = await Sale.findById(saleId);
    if (!originalSale) {
      return res.status(404).json({ message: 'Cash sale record not found' });
    }

    const originalQuantity = originalSale.quantityKg;
    const newQuantity = updateData.quantityKg !== undefined ? updateData.quantityKg : originalQuantity;
    const quantityChange = newQuantity - originalQuantity; 

    
    if (quantityChange !== 0) {
      const produce = await Produce.findOne({ name: originalSale.productSold });

      if (!produce) {
        console.warn(`Produce '${originalSale.productSold}' not found for sale ID ${saleId}. Stock cannot be adjusted.`);
   
      } else {
        if (quantityChange > 0 && produce.current_tonnage_kg < quantityChange) {
          return res.status(409).json({ message: `Insufficient stock to increase quantity. Need ${quantityChange} kgs more for ${originalSale.productSold}, but only ${produce.current_tonnage_kg} kgs available.` });
        }

        const updatedProduce = await Produce.findByIdAndUpdate(
          produce._id,
          { $inc: { current_tonnage_kg: -quantityChange } }, 
          { new: true, runValidators: true }
        );

        if (!updatedProduce) {
          throw new Error('Failed to update produce stock during sale update.');
        }
      }
    }

    const updatedSale = await Sale.findByIdAndUpdate(
      saleId,
      { $set: updateData }, 
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      return res.status(404).json({ message: 'Cash sale record not found after update attempt.' });
    }

    res.status(200).json(updatedSale);

  } catch (err) {
    console.error(`Error updating cash sale with ID ${saleId}:`, err);
    if (err.name === 'ValidationError') {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Failed to update cash sale', error: err.message });
    }
  }
});

router.delete('/:id', async (req, res) => {
  const saleId = req.params.id;

  try {
    const saleToDelete = await Sale.findById(saleId);
    if (!saleToDelete) {
      return res.status(404).json({ message: 'Cash sale record not found' });
    }

    const produce = await Produce.findOne({ name: saleToDelete.productSold });

    const deletedSale = await Sale.findByIdAndDelete(saleId);

    if (!deletedSale) {
      return res.status(404).json({ message: 'Cash sale record not found after delete attempt.' });
    }

    if (produce) {
      const updatedProduce = await Produce.findByIdAndUpdate(
        produce._id,
        { $inc: { current_tonnage_kg: saleToDelete.quantityKg } },
      );
      if (!updatedProduce) {
        console.warn(`Failed to return stock for produce '${saleToDelete.productSold}' after deleting sale ID ${saleId}. Produce not found or update failed.`);
      }
    } else {
      console.warn(`Produce '${saleToDelete.productSold}' not found for deleted sale ID ${saleId}. Stock could not be returned.`);
    }

    res.status(200).json({ message: 'Cash sale record deleted successfully', deletedSale });

  } catch (err) {
    console.error(`Error deleting cash sale with ID ${saleId}:`, err);
    res.status(500).json({ message: 'Failed to delete cash sale', error: err.message });
  }
});

module.exports = router;
