const express = require('express');
const router = express.Router(); 
const Branch = require('../models/Branch'); 
const bcrypt = require("bcrypt");

router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).json(branches);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ message: 'Failed to fetch branches', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.status(200).json(branch);
  } catch (err) {
    console.error(`Error fetching branch with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Failed to fetch branch', error: err.message });
  }
});

router.post('/', async (req, res) => {
  const newBranch = new Branch({
    name: req.body.name,
    location: req.body.location, 
    contactPhone: req.body.contactPhone, 
    contactEmail: req.body.contactEmail
   
  });

  try {
    const savedBranch = await newBranch.save();
   
    res.status(201).json(savedBranch);
  } catch (err) {

    console.error('Error creating branch:', err);
   
    if (err.name === 'ValidationError') {
        res.status(400).json({ message: err.message });
    } else if (err.code === 11000) { 
         res.status(400).json({ message: `Branch with name '${req.body.name}' already exists.` });
    }
    else {
        res.status(500).json({ message: 'Failed to create branch', error: err.message });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.status(200).json(updatedBranch);
  } catch (err) {
   
    console.error(`Error updating branch with ID ${req.params.id}:`, err);
     if (err.name === 'ValidationError') {
        res.status(400).json({ message: err.message });
    } else if (err.code === 11000) {
         res.status(400).json({ message: `Branch with name '${req.body.name}' already exists.` });
    }
    else {
        res.status(500).json({ message: 'Failed to update branch', error: err.message });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedBranch = await Branch.findByIdAndDelete(req.params.id);

    if (!deletedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.status(200).json({ message: 'Branch deleted successfully', deletedBranch });
  } catch (err) {
   
    console.error(`Error deleting branch with ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Failed to delete branch', error: err.message });
  }
});

module.exports = router;
