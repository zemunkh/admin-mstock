var express = require('express');
var app = express();
const cors = require('cors');
var bodyParser = require('body-parser');
var cron = require('node-cron');
const productionRoutes = require('./routes/counter');
const stockCounterRoutes = require('./routes/stockCounter');
const loggingRoutes = require('./routes/logging');

var ip = require('ip');

console.log(ip.address());

var task = cron.schedule(
  '0 9 * * *',
  () => {
    var now = new Date();
    console.log('Started at: ', now.toISOString());

    counterDb.selectAllZeroQty((err, rows) => {
      if (err) return [];
      rows.forEach((el) => {
        var logDate = new Date(el.created_at);
        var diff = new Date(now.getTime() - logDate.getTime());
        var diffHours = diff.getHours();
        // console.log(`Diff hours: ${diffHours}`);
        if (diffHours >= 24 && el.qty <= 0) {
          console.log(
            `Stock Name: ${el.stockCode} : ${el.totalQty} : ${el.created_at}`
          );
          counterDb.deleteById(el.id);
        }
      });
    });
  },
  {
    scheduled: false,
  }
);

task.start();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(cors());
const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
};

app.use(allowCrossDomain);

app.use('/counter', productionRoutes)
app.use('/stock_counter', stockCounterRoutes)
app.use('/logging', loggingRoutes.router)

app.get('/check', (req, res) => {
  console.log('Code: ', req.query.code);
  res.status(200).send({ code: req.query.code });
});

// app.use('/', router);

// app.get('/', (req, res) => {
//   res.json({ message: 'First connection is ok! 👌🏼' });
// });

let port = process.env.PORT || 8080;
// Create Server
var server = app.listen(port, () => {
  var port = server.address().port;
  console.log('App listening at http://localhost:%s', port);
  
});
