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

app.get('/', (req, res) => {
  res.json({ message: 'Server connection is ok! 👌🏼' });
});

let port = process.env.PORT || 8080;
// Create Server
var server = app.listen(port, () => {
  var port = server.address().port;
  console.log('App listening at http://localhost:%s', port);
  
});
