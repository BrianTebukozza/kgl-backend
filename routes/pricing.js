const express = require('express');
const router = express.Router(); 
const Produce = require('../models/Produce'); 

router.get('/', async (req, res) => {
  try {
   
    const producePrices = await Produce.find().select('name price_per_unit unit_of_measure');

    if (!producePrices || producePrices.length === 0) {
        return res.status(404).json({ message: 'No produce pricing data found' });
    }

    res.status(200).json(producePrices);
  } catch (err) {
    console.error('Error fetching produce pricing:', err);
    res.status(500).json({ message: 'Failed to fetch produce pricing', error: err.message });
  }
});

router.get('/:produceId', async (req, res) => {
  try {
    const producePrice = await Produce.findById(req.params.produceId).select('name price_per_unit unit_of_measure');

    if (!producePrice) {
      return res.status(404).json({ message: 'Produce not found with that ID' });
    }

    res.status(200).json(producePrice);
  } catch (err) {
    
    console.error(`Error fetching price for produce ID ${req.params.produceId}:`, err);
    res.status(500).json({ message: 'Failed to fetch produce price', error: err.message });
  }
});

router.put('/:produceId', async (req, res) => {
  const { price_per_unit } = req.body;

  if (price_per_unit === undefined || price_per_unit === null || typeof price_per_unit !== 'number' || price_per_unit < 0) {
      return res.status(400).json({ message: 'Valid non-negative price_per_unit is required' });
  }

  try {
    const updatedProduce = await Produce.findByIdAndUpdate(
      req.params.produceId,
      { $set: { price_per_unit: price_per_unit } },
      { new: true, runValidators: true }
    );

    if (!updatedProduce) {
      return res.status(404).json({ message: 'Produce not found with that ID' });
    }

    res.status(200).json({
        message: 'Produce price updated successfully',
        produce: {
            _id: updatedProduce._id,
            name: updatedProduce.name,
            price_per_unit: updatedProduce.price_per_unit,
            unit_of_measure: updatedProduce.unit_of_measure 
        }
    });
  } catch (err) {
    console.error(`Error updating price for produce ID ${req.params.produceId}:`, err);
     if (err.name === 'ValidationError') {
        res.status(400).json({ message: err.message });
    }
    else {
        res.status(500).json({ message: 'Failed to update produce price', error: err.message });
    }
  }
});

module.exports = router;
