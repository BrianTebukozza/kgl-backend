const express = require('express');
const router = express.Router(); 
const Produce = require('../models/Produce');

const LOW_STOCK_THRESHOLD = 100;

router.get('/', async (req, res) => {
  try {
    const stockLevels = await Produce.find().select('name current_tonnage_kg unit_of_measure');

    if (!stockLevels || stockLevels.length === 0) {
        return res.status(404).json({ message: 'No produce data found to check stock levels.' });
    }

    res.status(200).json(stockLevels);
  } catch (err) {
    console.error('Error fetching stock levels:', err);
    res.status(500).json({ message: 'Failed to fetch stock levels', error: err.message });
  }
});

router.get('/:produceId', async (req, res) => {
  try {

    const produceStock = await Produce.findById(req.params.produceId).select('name current_tonnage_kg unit_of_measure');

    if (!produceStock) {
      return res.status(404).json({ message: 'Produce not found with that ID.' });
    }

    res.status(200).json(produceStock);
  } catch (err) {

    console.error(`Error fetching stock for produce ID ${req.params.produceId}:`, err);
    res.status(500).json({ message: 'Failed to fetch produce stock', error: err.message });
  }
});

router.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Produce.find({ current_tonnage_kg: { $lte: LOW_STOCK_THRESHOLD } }).select('name current_tonnage_kg unit_of_measure');

    res.status(200).json(lowStockItems);
  } catch (err) {
    console.error('Error fetching low stock alerts:', err);
    res.status(500).json({ message: 'Failed to fetch low stock alerts', error: err.message });
  }
});

module.exports = router;
