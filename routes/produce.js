const express = require('express');
const Produce = require('../models/Produce');

const router = express.Router(); //router instance

router.get('/', async (req, res) => {
    const produce = await Produce.find().sort({ createdAt: -1 });
    res.json(produce);
});

router.post('/', async (req, res) => {
    const produce = new Produce(req.body);
    await produce.save();
    res.status(201).json(produce);
});

module.exports = router;