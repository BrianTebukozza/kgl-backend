const express = require('express');
const router = express.Router(); 
const Sale = require('../models/Sale');
const CreditSale = require('../models/CreditSale'); 
const Produce = require('../models/Produce');
const Branch = require('../models/Branch');

function authorizeDirector(req, res, next) {
  if (req.user && req.user.role === 'director') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Only the Director can view reports.' });
  }
}

router.use(authorizeDirector);

router.get('/summary/total-sales', async (req, res) => {
  try {
    const result = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalSalesAmount: { $sum: '$totalAmountUgx' }
        }
      },
      {
        $project: {
          _id: 0,
          totalSalesAmount: 1
        }
      }
    ]);

    const totalSales = result.length > 0 ? result[0].totalSalesAmount : 0;

    res.status(200).json({ totalSalesUgx: totalSales });
  } catch (err) {
    console.error('Error fetching total sales:', err);
    res.status(500).json({ message: 'Failed to fetch total sales', error: err.message });
  }
});

router.get('/summary/total-credit-due', async (req, res) => {
  try {
    const result = await CreditSale.aggregate([
      {
        $group: {
          _id: null,
          totalCreditAmountDue: { $sum: '$amountDueUgx' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCreditAmountDue: 1
        }
      }
    ]);

    const totalCreditDue = result.length > 0 ? result[0].totalCreditAmountDue : 0;

    res.status(200).json({ totalCreditDueUgx: totalCreditDue });
  } catch (err) {
    console.error('Error fetching total credit due:', err);
    res.status(500).json({ message: 'Failed to fetch total credit due', error: err.message });
  }
});

router.get('/summary/total-procured-tonnage', async (req, res) => {
  try {
    const result = await Produce.aggregate([
      {
        $group: {
          _id: null,
          totalProcuredTonnage: { $sum: '$tonnageKg' }
        }
      },
      {
        $project: {
          _id: 0, 
          totalProcuredTonnage: 1
        }
      }
    ]);

    const totalProcuredTonnage = result.length > 0 ? result[0].totalProcuredTonnage : 0;

    res.status(200).json({ totalProcuredTonnageKg: totalProcuredTonnage });
  } catch (err) {
    console.error('Error fetching total procured tonnage:', err);
    res.status(500).json({ message: 'Failed to fetch total procured tonnage', error: err.message });
  }
});

router.get('/summary/branch-summary', async (req, res) => {
  try {
   
    const salesByBranch = await Sale.aggregate([
      {
        $group: {
          _id: '$branch', 
          totalSalesAmount: { $sum: '$totalAmountUgx' }
        }
      },
      {
        $project: {
          _id: 0,
          branchName: '$_id',
          totalSalesAmount: 1
        }
      }
    ]);

    const creditSalesByBranch = await CreditSale.aggregate([
      {
        $group: {
          _id: '$branch',
          totalCreditAmountDue: { $sum: '$amountDueUgx' }
        }
      },
       {
        $project: {
          _id: 0,
          branchName: '$_id',
          totalCreditAmountDue: 1
        }
      }
    ]);

    const procurementByBranch = await Produce.aggregate([
      {
        $group: {
          _id: '$branch', 
          totalProcuredTonnage: { $sum: '$tonnageKg' }
        }
      },
       {
        $project: {
          _id: 0,
          branchName: '$_id',
          totalProcuredTonnage: 1
        }
      }
    ]);

    const salesMap = new Map(salesByBranch.map(item => [item.branchName, item.totalSalesAmount]));
    const creditSalesMap = new Map(creditSalesByBranch.map(item => [item.branchName, item.totalCreditAmountDue]));
    const procurementMap = new Map(procurementByBranch.map(item => [item.branchName, item.totalProcuredTonnage]));

    const allBranchNames = new Set([
        ...salesMap.keys(),
        ...creditSalesMap.keys(),
        ...procurementMap.keys()
    ]);

    const branchSummary = Array.from(allBranchNames).map(branchName => ({
        branchName: branchName,
        totalSalesUgx: salesMap.get(branchName) || 0, 
        totalCreditDueUgx: creditSalesMap.get(branchName) || 0, 
        totalProcuredTonnageKg: procurementMap.get(branchName) || 0
    }));


    res.status(200).json(branchSummary);
  } catch (err) {
    console.error('Error fetching branch summary:', err);
    res.status(500).json({ message: 'Failed to fetch branch summary', error: err.message });
  }
});

router.get('/summary/produce-summary', async (req, res) => {
    try {
      
        const salesByProduce = await Sale.aggregate([
             {
                $group: {
                    _id: '$productSold',
                    totalSalesQuantity: { $sum: '$quantityKg' }
                }
            },
            {
                $project: {
                    _id: 0,
                    produceName: '$_id',
                    totalSalesQuantityKg: '$totalSalesQuantity'
                }
            }
        ]);

        const creditSalesByProduce = await CreditSale.aggregate([
             {
                $group: {
                    _id: '$productSold',
                    totalCreditSalesQuantity: { $sum: '$quantityKg' }
                }
            },
             {
                $project: {
                    _id: 0,
                    produceName: '$_id',
                    totalCreditSalesQuantityKg: '$totalCreditSalesQuantity'
                }
            }
        ]);

        const salesQuantityMap = new Map(salesByProduce.map(item => [item.produceName, item.totalSalesQuantityKg]));
        const creditSalesQuantityMap = new Map(creditSalesByProduce.map(item => [item.produceName, item.totalCreditSalesQuantityKg]));

        const allProduceNames = new Set([
            ...salesQuantityMap.keys(),
            ...creditSalesQuantityMap.keys()
        ]);

        const produceSummary = Array.from(allProduceNames).map(produceName => ({
            produceName: produceName,
            totalSalesQuantityKg: salesQuantityMap.get(produceName) || 0,
            totalCreditSalesQuantityKg: creditSalesQuantityMap.get(produceName) || 0
        }));


        res.status(200).json(produceSummary);

    } catch (err) {
        console.error('Error fetching produce summary:', err);
        res.status(500).json({ message: 'Failed to fetch produce summary', error: err.message });
    }
});

module.exports = router;
