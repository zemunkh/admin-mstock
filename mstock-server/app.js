var express = require('express');
var app = express();
const router = express.Router();
const cors = require('cors');
const scheduledFunctions = require('./app/cron');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ 
  extended: true
}));
app.use(bodyParser.json());

app.use(cors());
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain)

const DB = require('./app/db/db_counter.js');
const DBLogging = require('./app/db/db_log.js');

const loggingDb = new DBLogging("loggingSqlite.db");
const counterDb = new DB("counterSqlite.db");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


router.post('/counter/create', (req, res) => {
  console.log("Stock: 👉 ", req.body);
  if(Object.keys(req.body).length === 0) {
    return res.status(500).send("Null values received. Can't proceed.");
  }
  counterDb.insert([
    req.body.stockId,
    req.body.stockCode,
    req.body.stockName,
    req.body.machine,
    req.body.shift,
    req.body.category,
    req.body.stockGroup,
    req.body.class,
    req.body.weight,
    req.body.qty,
    req.body.totalQty,
    req.body.purchasePrice,
    req.body.uom,
    req.body.updated_at,
    req.body.created_at,
  ],
  (id, err) => {
    if(err) return res.status(500).send("Problem ocurred during creating Counter");
    counterDb.selectById(id, (err, rows) => {
      if(err) return res.status(500).send("Problem occurred during getting counters");
      res.status(200).send(rows);
      loggingDb.insert([
        'create',
        rows.stockId,
        rows.stockCode,
        rows.stockName,
        rows.machine,
        rows.shift,
        rows.category,
        rows.stockGroup,
        rows.class,
        rows.weight,
        rows.totalQty,
        rows.purchasePrice,
        rows.uom,
        rows.created_at,
      ],
      (err) => {
        if(err) return res.status(500).send("Problem ocurred during creating Logging data");
        console.log('✅ Saved stock: ', rows.stockCode)
      })
    })
  })
});

router.get('/counter', (req, res) => {
  console.log("StockCode: ✅", req.query.stockCode);
  counterDb.selectByCode(req.query.stockCode, (err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    res.status(200).send(rows);
  })
});

router.get('/counter/stock/machine', (req, res) => {
  console.log("StockCode Machine: ✅", req.query.stockCode + ' : ' + req.query.machine);
  counterDb.selectByCodeAndMachine([
    req.query.stockCode,
    req.query.machine,
  ],
    (err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    res.status(200).send(rows);
  })
});

router.get('/counter/order', (req, res) => {
  console.log("StockCode: ✅ Order", req.query.stockCode);
  counterDb.selectByCodeAndDate(req.query.stockCode, (err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    res.status(200).send(rows);
  })
});

router.delete('/counter/delete', async (req, res) => {
  console.log("Delete ID 👉: ", req.body.id);
  counterDb.selectById(parseInt(req.body.id), (err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    // res.status(200).send(rows);
    loggingDb.insert([
      'delete',
      rows.stockId,
      rows.stockCode,
      rows.stockName,
      rows.machine,
      rows.shift,
      rows.category,
      rows.stockGroup,
      rows.class,
      rows.weight,
      rows.totalQty,
      rows.purchasePrice,
      rows.uom,
      rows.created_at,
    ],
    (id, err) => {
      if(err) return res.status(500).send("Problem ocurred during fetching Counter");
        console.log('✅ Saved =', id)
        counterDb.deleteById([
          req.body.id,
        ],
        (err) => {
          if(err) return res.status(500).send("Problem occurred during deleting counter");
          res.status(200).send({id: req.body.id});
        });
    })
  })
});

router.post('/counter/updateQty', async (req, res) => {
  console.log("ID: ", req.body.id);
  counterDb.updateQty(
    [
      req.body.qty,
      req.body.totalQty,
      req.body.updated_at,
      req.body.id,
    ]
  ,
  (err) => {
    if(err) return res.status(500).send("Problem occurred during updating counter");
    counterDb.selectById(parseInt(req.body.id), (err, rows) => {
      if(err) return res.status(500).send("Problem occurred during getting counters");
      res.status(200).send(rows);
      loggingDb.insert([
        'update',
        rows.stockId,
        rows.stockCode,
        rows.stockName,
        rows.machine,
        rows.shift,
        rows.category,
        rows.stockGroup,
        rows.class,
        rows.weight,
        rows.totalQty,
        rows.purchasePrice,
        rows.uom,
        rows.created_at,
      ],
      (id, err) => {
        if(err) return res.status(500).send("Problem ocurred during creating Counter");
        console.log('✅ Saved =', id)
      })
    })
  });
});

router.post('/counter/updateWeight', async (req, res) => {
  const updatedTime = new Date();
  console.log("ID: ", req.body.id);
  counterDb.updateWeight(
    [
      req.body.weight,
      updatedTime.toISOString(),
      req.body.id,
    ]
  ,
  (err) => {
    if(err) return res.status(500).send("Problem occurred during updating counter");
    counterDb.selectById(parseInt(req.body.id), (err, rows) => {
      if(err) return res.status(500).send("Problem occurred during getting counters");
      res.status(200).send(rows);
      loggingDb.insert([
        'update',
        rows.stockId,
        rows.stockCode,
        rows.stockName,
        rows.machine,
        rows.shift,
        rows.category,
        rows.stockGroup,
        rows.class,
        rows.weight,
        rows.totalQty,
        rows.purchasePrice,
        rows.uom,
        rows.created_at,
      ],
      (id, err) => {
        if(err) return res.status(500).send("Problem ocurred during creating Counter");
        console.log('✅ Saved =', id)
      })
    })
  });
});

router.get('/counter/all', (req, res) => {
  counterDb.selectAll((err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    res.status(200).send(rows);
  })
});

router.get('/counter/machine', (req, res) => {
  console.log("Machine: ✅ ", req.query.machine);
  counterDb.selectByMachine(req.query.machine, (err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    res.status(200).send(rows);
  })
});

router.get('/logging/all', (req, res) => {
  loggingDb.selectAll((err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting log data");
    res.status(200).send(rows);
  })
});

router.delete('/logging/delete', async (req, res) => {
  console.log("Delete ID 👉: ", req.body.id);
  loggingDb.deleteById([
    req.body.id,
  ],
  (err) => {
    if(err) return res.status(500).send("Problem occurred during deleting counter");
    res.status(200).send({id: req.body.id});
  });

});

app.use('/', router);

app.get('/', (req, res) => {
  res.json({message: "First connection is ok! 👌🏼"});
});

scheduledFunctions.initScheduledJobs();

let port = process.env.PORT || 3000;
// Create Server
var server = app.listen(port, () => {
  var port = server.address().port
  console.log("App listening at http://localhost:%s", port);
});