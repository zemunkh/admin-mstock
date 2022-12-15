const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');

const db_log = require('../app/db/db_log.js');

const loggingDb = new db_log('loggingSqlite.db');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/create', (req, res) => {
  // console.log('Stock: 👉 ', req.body);
  if (Object.keys(req.body).length === 0) {
    return res.status(500).send("Null values received. Can't proceed.");
  }
  var now = new Date();
  console.log('Production created by Loose stockIn: ', now.toISOString());
  loggingDb.insert(
    [
      cardId,
      rows.stockCode,
      rows.stockName,
      rows.device,
      '',
      0,
      now.toISOString(),
      1,
      rows.uom,
      rows.totalQty,
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
    (id, err) => {
      if (err)
        return res.status(500).send('Problem ocurred during creating logging');
      res.status(200).send(id);
    }
  );
});

router.get('/all', (req, res) => {
  loggingDb.selectAll((err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting log data');
    res.status(200).send(rows);
  });
});

router.get('/range', (req, res) => {
  if (req.query.start == null) {
    const today = new Date();
    req.query.start = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
  }
  var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
  var localStart = new Date(new Date(req.query.start) - tzoffset)
    .toISOString()
    .slice(0, -1);
  var localEnd = new Date(new Date(req.query.end) - tzoffset)
    .toISOString()
    .slice(0, -1);

  // console.log(`👉 Dates: ${localStart} : ${localEnd}`)

  loggingDb.selectByRange([localStart, localEnd], (err, rows) => {
    if (err)
      return res.status(500).send('Problem occurred during getting log data');
    res.status(200).send(rows);
    // console.log('Result: ', rows);
  });
});

router.delete('/delete', async (req, res) => {
  console.log('Delete ID 👉: ', req.body.id);
  loggingDb.deleteById([req.body.id], (err) => {
    if (err)
      return res.status(500).send('Problem occurred during deleting counter');
    res.status(200).send({ id: req.body.id });
  });
});

module.exports = router;