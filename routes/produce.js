const express = require('express');
const Produce = require('../models/Produce');

const router = express.Router();

router.get('/', async (req, res) => {
    try{
    const produce = await Produce.find().sort({ createdAt: -1 });
    res.json(produce);
} catch (err) {
    console.error("Error fetching produce:", err);
    res.status(500).json({message: 'Error fetching produce', error: err.message});
}
});

router.post('/', async (req, res) => {
    try {
        const produceData = req.body;

        if (!produceData.produceName || produceData.produceName.length < 2) {
             return res.status(400).json({ message: 'Produce Name is required and must be at least 2 characters.' });
        }
         if (!produceData.produceType || produceData.produceType.length < 2) { 
             return res.status(400).json({ message: 'Produce Type is required and must be at least 2 characters.' });
         }
         if (!produceData.dateTime) {
             return res.status(400).json({ message: 'Date and Time is required.' });
         }
         if (produceData.tonnage === null || produceData.tonnage === undefined || produceData.tonnage < 1000) {
             return res.status(400).json({ message: 'Tonnage is required and must be at least 1000 kgs.' });
         }
          if (produceData.cost === null || produceData.cost === undefined || produceData.cost < 0) {
             return res.status(400).json({ message: 'Cost is required and must be a non-negative number.' });
         }
         if (!produceData.dealerName || produceData.dealerName.length < 2) {
              return res.status(400).json({ message: 'Dealer Name is required and must be at least 2 characters.' });
         }
         if (!produceData.branch || !['Maganjo', 'Matugga'].includes(produceData.branch)) {
             return res.status(400).json({ message: 'Valid Branch is required.' });
         }
         if (!produceData.contact) {
             return res.status(400).json({ message: 'Dealer Contact is required.' });
         }
         if (produceData.salePrice === null || produceData.salePrice === undefined || produceData.salePrice < 0) {
             return res.status(400).json({ message: 'Selling price is required and must be a non-negative number.' });
         }

        const newProduce = new Produce({
            ...produceData, 
            remainingTonnage: produceData.tonnage 
        });

        const savedProduce = await newProduce.save();

        res.status(201).json(savedProduce);

    } catch (err) {
        console.error("Error saving produce:", err);
        if (err.name === 'ValidationError') {
             const messages = Object.values(err.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Error saving produce to database', error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const produce = await Produce.findById(req.params.id);
        if (!produce) {
            return res.status(404).json({ message: 'Produce not found.' });
        }
        res.json(produce);
    } catch (err) {
        console.error(`Error fetching produce with ID ${req.params.id}:`, err);
      
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Produce ID format.' });
        }
        res.status(500).json({ message: 'Failed to fetch produce', error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedProduce = await Produce.findByIdAndDelete(req.params.id);

        if (!deletedProduce) {
            return res.status(404).json({ message: 'Produce not found.' });
        }

        res.status(200).json({ message: 'Produce deleted successfully', deletedProduce });

    } catch (err) {
        console.error(`Error deleting produce with ID ${req.params.id}:`, err);
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Produce ID format.' });
        }
        res.status(500).json({ message: 'Failed to delete produce', error: err.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const produceId = req.params.id;
        const updateData = req.body;

        const updatedProduce = await Produce.findByIdAndUpdate(
            produceId,
            { $set: updateData }, 
            { new: true, runValidators: true }
        );

        if (!updatedProduce) {
            return res.status(404).json({ message: 'Produce not found.' });
        }

        res.status(200).json(updatedProduce);

    } catch (err) {
        console.error(`Error updating produce with ID ${req.params.id}:`, err);
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Produce ID format.' });
        }
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Failed to update produce', error: err.message });
    }
});

module.exports = router;