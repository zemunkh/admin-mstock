const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');

const db_counter = require('../app/db/db_counter.js');
const { createNewLog, deleteLogByCounterId } = require('./logging');

const counterDb = new db_counter();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/create', (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(500).send("Null values received. Can't proceed.");
  }
  console.log('✅ Shift date ', req.body.shiftDate)
  counterDb.insert(
    [
      req.body.stockId,
      req.body.stockCode,
      req.body.stockName,
      req.body.machine,
      req.body.device,
      req.body.shift,
      req.body.category,
      req.body.stockGroup,
      req.body.class,
      req.body.weight,
      req.body.qty,
      req.body.totalQty,
      req.body.purchasePrice,
      req.body.uom,
      req.body.shiftDate,
      req.body.updated_at,
      req.body.created_at,
    ],
    (id, err) => {
      if (err)
        return res.status(500).send('Problem ocurred during creating Counter');
      counterDb.selectById(id, (err, rows) => {
        if (err)
          return res
            .status(500)
            .send('Problem occurred during getting counters');
        var now = new Date();
        console.log('New log creating: ', now.toISOString());

        createNewLog({
          counterId: id,
          stockCode: req.body.stockCode,
          stockName: req.body.stockName,
          device: req.body.device,
          productionDate: now.toISOString(),
          prodQty: 1, 
          stockInDate: '',
          stockInQty: 0,
          uom: req.body.uom,
          totalQty: (req.body.totalQty / req.body.qty),
          category: req.body.category,
          stockGroup: req.body.stockGroup,
          class: req.body.class,
          weight: req.body.weight,
          shift: req.body.shift,
          machine: req.body.machine,
          purchasePrice: req.body.purchasePrice,
          shiftDate: req.body.shiftDate,
          created_at: req.body.created_at
        });
        
        res.status(200).send(rows);
      });
    }
  );
});

router.get('/', (req, res) => {
  // console.log('StockCode: ✅', req.query.stockCode);
  counterDb.selectByCode(req.query.stockCode, (err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting counters');
    res.status(200).send(rows);
  });
});

router.get('/stock/machine', (req, res) => {
  // console.log('StockCode Machine: ✅', req.query.stockCode + ' : ' + req.query.machine);
  counterDb.selectByCodeAndMachine(
    [req.query.stockCode, req.query.machine],
    (err, rows) => {
      if (err)
        return res.status(500).send('Problem occurred during getting counters');
      // console.log('res: 👉 ', rows);
      res.status(200).send(rows);
    }
  );
});

router.get('/order', (req, res) => {
  // console.log('StockCode: ✅ Order', req.query.stockCode);
  counterDb.selectByCodeAndDate(req.query.stockCode, (err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting counters');
    res.status(200).send(rows);
  });
});

router.delete('/delete', async (req, res) => {
  counterDb.selectById(parseInt(req.body.id), (err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting counters');
    // res.status(200).send(rows);
    deleteLogByCounterId(req.body.id, (val) => {
      if(val.status == 200) {
        console.log('🐶 Successfully deleted!')
      }
    })
    counterDb.deleteById([req.body.id], (err) => {
      if (err)
        return res
          .status(500)
          .send('Problem occurred during deleting counter');
      res.status(200).send({ id: req.body.id });
    });
  });
});

router.post('/add', async (req, res) => {
  // const updatedTime = new Date();
  // console.log('ID: ', req.body.id);
  counterDb.updateQty(
    [req.body.qty, req.body.totalQty, req.body.updated_at, req.body.id],
    (err) => {
      if (err)
        return res.status(500).send('Problem occurred during updating counter');
      counterDb.selectById(parseInt(req.body.id), (err, row) => {
        if (err)
          return res
            .status(500)
            .send('Problem occurred during getting counters');
        
        // Update the log
        var now = new Date();
        console.log('Production Qty updated - New log creating: ', now.toISOString());
        createNewLog({
          counterId: row.id,
          stockCode: row.stockCode,
          stockName: row.stockName,
          device: row.device,
          productionDate: now.toISOString(),
          prodQty: 1, 
          stockInDate: '',
          stockInQty: 0,
          uom: row.uom,
          totalQty: (req.body.totalQty / req.body.qty),
          category: row.category,
          stockGroup: row.stockGroup,
          class: row.class,
          weight: row.weight,
          shift: row.shift,
          machine: row.machine,
          purchasePrice: row.purchasePrice,
          shiftDate: row.shiftDate,
          created_at: row.created_at
        });
        res.status(200).send(row); 
      });
    }
  );
});

router.post('/drop', async (req, res) => {
  // const updatedTime = new Date();
  // console.log('ID: ', req.body.id);
  counterDb.updateQty(
    [req.body.qty, req.body.totalQty, req.body.updated_at, req.body.id],
    (err) => {
      if (err)
        return res.status(500).send('Problem occurred during updating counter');
      // Delete existing log
      counterDb.selectById(parseInt(req.body.id), (err, row) => {
        if (err)
          return res
            .status(500)
            .send('Problem occurred during getting counters');

        // console.log('Production Qty Empty: ', now.toISOString());
        // deleteLogByCounterId(req.body.id)
        res.status(200).send(row); 
      });
    }
  );
});


router.get('/all', (req, res) => {
  counterDb.selectAll((err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting counters');
    res.status(200).send(rows);
  });
});

router.get('/machine', (req, res) => {
  console.log('Machine: ✅ ', req.query.machine);
  counterDb.selectByMachine([req.query.machine], (err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting counters');
    // console.log('rows: 👉 ', rows);
    res.status(200).send(rows);
  });
});

module.exports = router;