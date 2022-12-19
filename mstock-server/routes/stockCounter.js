const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');

const db_stock_counter = require('../app/db/db_stock_counter.js');
const db_log = require('../app/db/db_log.js');

const loggingDb = new db_log();
const stockCounterDb = new db_stock_counter();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// readCounterInsNotPosted
// readCounterInsPosted
// readCounterByCodeAndMachine
// readAllCounters
// update
// updatePostedStatus
// delete

router.post('/create', (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(500).send("Null values received. Can't proceed.");
  }
  stockCounterDb.insert(
    [
      req.body.counterId,
      req.body.stock,
      req.body.description,
      req.body.machine,
      req.body.shift,
      req.body.device,
      req.body.uom,
      req.body.qty,
      req.body.purchasePrice,
      req.body.isPosted,
      req.body.shiftDate,
      req.body.updated_at,
      req.body.created_at
    ], (id, err) => {
    if(err) 
      return res.status(500).send('Problem ocurred during creating stockCounter.')
    stockCounterDb.selectById(id, (err, row) => {
      if (err)
        return res.status(500).send('Problem occurred during getting counters')
      
      res.status(200).send(row);
      console.log('🎯 ROW: ', row)
      var now = new Date();
      console.log('Production created: ', now.toISOString());
      loggingDb.updateStockIn(
        [
          1,
          now.toISOString(),
          row.counterId
        ],
        (err) => {
          if (err)
            return res.status(500).send('Problem occurred during updating logs')
        }
      )
    })
  })
});

router.get('/status', (req, res) => {
  if(req.query.posted == 1) {
    stockCounterDb.selectByPosted((err, rows) => {
      if (err)
        return res.status(500).send('Problem occurred during getting counters');
      res.status(200).send(rows);
    })
  } else if (req.query.posted == 0) {
    stockCounterDb.selectByNotPosted((err, rows) => {
      if (err)
        return res.status(500).send('Problem occurred during getting counters');
      res.status(200).send(rows);
      // console.log('🎯 Query result: ', rows)
    })
  } else {
    res.status(500).send('Query is not available.');
  }
});

router.get('/read', (req, res) => {
  stockCounterDb.selectById(
    [req.query.id],
    (err, row) => {
      if (err)
        return res.status(500).send('Problem occurred during getting counter');
      // console.log('res: 👉 ', rows);
      res.status(200).send(row);
    }
  );
});

router.get('/machine', (req, res) => {
  // console.log('StockCode Machine: ✅', req.query.stockCode + ' : ' + req.query.machine);
  stockCounterDb.selectByCodeAndMachine(
    [req.query.stockCode, req.query.machine],
    (err, rows) => {
      if (err)
        return res.status(500).send('Problem occurred during getting counters');
      // console.log('res: 👉 ', rows);
      res.status(200).send(rows);
    }
  );
});

router.get('/all', (req, res) => {
  stockCounterDb.selectAll((err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting counters');
    res.status(200).send(rows);
  });
});

router.post('/update', async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(500).send("Null values received. Can't proceed.");
  }
  console.log('ID: ✅ ', req.body.id);
  stockCounterDb.updateQty(
    [req.body.qty, req.body.updated_at, req.body.id], (err) => {
    if(err) 
      return res.status(500).send('Problem ocurred during creating stockCounter.')
    stockCounterDb.selectById(parseInt(req.body.id), (err, row) => {
      if (err)
        return res.status(500).send('Problem occurred during getting counters')
      var now = new Date();
      
      loggingDb.selectZeroStockInByCounterId(parseInt(req.body.counterId), (err, rows) => {
        if (err)
          console.log('Error: ', err);

        console.log('Zero StockIn Logs: 👉', rows);
        
        if(rows.length > 0) {
          loggingDb.updateStockIn(
            [
              1,
              now.toISOString(),
              rows[0].id
            ],
            (err) => {
              if (err)
                console.log('Error: ', err);
                // return res.status(500).send('Problem occurred during updating logs')
            }
          )
        } else {
          console.log('👉 Not found');
        }
      });
      
      res.status(200).send(row);
    })
  })
});

router.post('/updateStatus', (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(500).send("Null values received. Can't proceed.");
  }
  var now = new Date();
  console.log('New Production created: ', now.toISOString());
  stockCounterDb.updateStatus(
    [
      req.body.isPosted,
      now.toISOString(),
      req.body._id,
    ], (err) => {
    if(err) 
      return res.status(500).send('Problem ocurred during creating stockCounter.')
    stockCounterDb.selectById(req.body._id, (err, row) => {
      if (err)
        return res.status(500).send('Problem occurred during getting counters')
      res.status(200).send({ id: req.body._id });

    })
  })
});

router.delete('/delete', (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(500).send("Null values received. Can't proceed.");
  }

  stockCounterDb.selectById(parseInt(req.body.id), (err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting counters');
    // res.status(200).send(rows);
    loggingDb.deleteByCounterId([req.body.id], (err) => {
        if (err)
          return res
            .status(500)
            .send('Problem ocurred during fetching Counter');
        counterDb.deleteById([req.body.id], (err) => {
          if (err)
            return res
              .status(500)
              .send('Problem occurred during deleting counter');
          res.status(200).send({ id: req.body.id });
        });
      }
    );
  });
});

module.exports = router;