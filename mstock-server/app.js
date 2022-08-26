var express = require('express');
var app = express();
const router = express.Router();
const cors = require('cors');
var bodyParser = require('body-parser');
var cron = require('node-cron');

var task = cron.schedule('* */12 * * *', () =>  {
  var now = new Date();
  console.log("Started at: ", now.toISOString());

  counterDb.selectAllZeroQty((err, rows) => {
    if(err) return []
    rows.forEach(el => {
      var logDate = new Date(el.created_at);
      var diff = new Date(now.getTime() - logDate.getTime());
      var diffHours = diff.getHours();
      console.log(`Diff hours: ${diffHours}`);
      if(diffHours >= 24) {
        console.log(`Stock Name: ${el.stockCode} : ${el.totalQty} : ${el.created_at}`);
        counterDb.deleteById(el.id);
      }
    });
  })
}, {
  scheduled: false
});

task.start();


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
  // console.log("Stock: 👉 ", req.body);
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
    req.body.shiftDate,
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
        rows.stockName,
        rows.stockCode,
        rows.machine,
        rows.shift,
        rows.category,
        rows.stockGroup,
        rows.class,
        rows.weight,
        rows.totalQty,
        rows.purchasePrice,
        rows.uom,
        rows.shiftDate,
        rows.created_at,
      ],
      (err) => {
        if(err) return res.status(500).send("Problem ocurred during creating Logging data");
        // console.log('✅ Saved stock: ', rows.stockCode)
      })
    })
  })
});

router.get('/counter', (req, res) => {
  // console.log("StockCode: ✅", req.query.stockCode);
  counterDb.selectByCode(req.query.stockCode, (err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    res.status(200).send(rows);
  })
});

router.get('/counter/stock/machine', (req, res) => {
  // console.log("StockCode Machine: ✅", req.query.stockCode + ' : ' + req.query.machine);
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
  // console.log("StockCode: ✅ Order", req.query.stockCode);
  counterDb.selectByCodeAndDate(req.query.stockCode, (err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    res.status(200).send(rows);
  })
});

router.delete('/counter/delete', async (req, res) => {
  // console.log("Delete ID 👉: ", req.body.id);
  counterDb.selectById(parseInt(req.body.id), (err, rows) => {
    if(err) return res.status(500).send("Problem occurred during getting counters");
    // res.status(200).send(rows);
    loggingDb.insert([
      'delete',
      rows.stockId,
      rows.stockName,
      rows.stockCode,
      rows.machine,
      rows.shift,
      rows.category,
      rows.stockGroup,
      rows.class,
      rows.weight,
      rows.totalQty,
      rows.purchasePrice,
      rows.uom,
      rows.shiftDate, 
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
        rows.stockName,
        rows.stockCode,
        rows.machine,
        rows.shift,
        rows.category,
        rows.stockGroup,
        rows.class,
        rows.weight,
        rows.totalQty,
        rows.purchasePrice,
        rows.uom,
        rows.shiftDate, 
        rows.created_at,
      ],
      (id, err) => {
        if(err) return res.status(500).send("Problem ocurred during creating Counter");
        // console.log('✅ Saved =', id)
      })
    })
  });
});

router.post('/counter/updateWeight', async (req, res) => {
  const updatedTime = new Date();
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
        rows.stockName,
        rows.stockCode,
        rows.machine,
        rows.shift,
        rows.category,
        rows.stockGroup,
        rows.class,
        rows.weight,
        rows.totalQty,
        rows.purchasePrice,
        rows.uom,
        rows.shiftDate, 
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


router.get('/logging/range', (req, res) => {
  if(req.query.start == null) {
    const today = new Date();
    req.query.start = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
  }
  var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  var localStart = (new Date(new Date(req.query.start) - tzoffset)).toISOString().slice(0, -1);
  var localEnd = (new Date(new Date(req.query.end) - tzoffset)).toISOString().slice(0, -1);

  // console.log(`👉 Dates: ${localStart} : ${localEnd}`)

  loggingDb.selectByRange([
    localStart,
    localEnd
  ], (err, rows) => {
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

let port = process.env.PORT || 8080;
// Create Server
var server = app.listen(port, () => {
  var port = server.address().port
  console.log("App listening at http://localhost:%s", port);
});