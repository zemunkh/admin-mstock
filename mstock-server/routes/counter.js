const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');

const db_counter = require('../app/db/db_counter.js');
const db_log = require('../app/db/db_log.js');

const loggingDb = new db_log();
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
        res.status(200).send(rows);
        var now = new Date();
        console.log('Production created: ', now.toISOString());
        loggingDb.insert(
          [
            id,
            rows.stockCode,
            rows.stockName,
            rows.device,
            now.toISOString(),
            1,
            '',
            0,
            rows.uom,
            (req.body.totalQty / req.body.qty),
            rows.category,
            rows.stockGroup,
            rows.class,
            rows.weight,
            rows.shift,
            rows.machine,
            rows.purchasePrice,
            rows.shiftDate,
            rows.created_at,
          ],
          (err) => {
            if (err)
              return res
                .status(500)
                .send('Problem ocurred during creating Logging data');
            // console.log('✅ Saved stock: ', rows.stockCode)
          }
        );
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

router.post('/add', async (req, res) => {
  // const updatedTime = new Date();
  console.log('ID: ', req.body.id);
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
        console.log('Production Qty updated: ', now.toISOString());
        loggingDb.insert(
          [
            row.id,
            row.stockCode,
            row.stockName,
            row.device,
            now.toISOString(),
            1,
            '',
            0,
            row.uom,
            (req.body.totalQty / req.body.qty),
            row.category,
            row.stockGroup,
            row.class,
            row.weight,
            row.shift,
            row.machine,
            row.purchasePrice,
            row.shiftDate,
            row.created_at,
          ],
          (err) => {
            if (err)
              return res
                .status(500)
                .send('Problem ocurred during creating Logging data');
            // console.log('✅ Saved stock: ', rows.stockCode)
          }
        );
        res.status(200).send(row); 

      });
    }
  );
});

router.post('/drop', async (req, res) => {
  // const updatedTime = new Date();
  console.log('ID: ', req.body.id);
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

         // Update the log
        var now = new Date();
        console.log('Production Qty Empty: ', now.toISOString());
        // loggingDb.updateCounter(
        //   [
        //     0,
        //     now.toISOString(),
        //     row.id,
        //   ],
        //   (err) => {
        //     if (err)
        //       return res
        //         .status(500)
        //         .send('Problem ocurred during creating Logging data');
        //     // console.log('✅ Saved stock: ', rows.stockCode)
        //   }
        // );
        // loggingDb.deleteById(
        //   [row.id],
        //   (err) => {
        //     if (err)
        //       return res
        //         .status(500)
        //         .send('Problem ocurred during creating Logging data');
        //     // console.log('✅ Saved stock: ', rows.stockCode)
        //   }
        // );
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
    console.log('rows: 👉 ', rows);
    res.status(200).send(rows);
  });
});

module.exports = router;