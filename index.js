const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');

var app = express()

const config = require('./config');
console.log(config.mongoURI);
// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(() => {
  console.log('MongoDB Connected');
}).catch(err => console.log(err));



// EJS
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.json());
// Express body parser
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());



// Routes
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/apiRouter');

app.use('/api/v1', apiRouter);
app.use('/', indexRouter);

app.use((req, res) => {
  res.status(404).render('pages/404');
});



const PORT = config.PORT || 9000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
app.on('error', onError);
app.on('listening', onListening);

function onError(error) {
  if(error.syscall !== 'listen') throw error;
  let bind = _.isString(PORT) ? 'Pipe ' + PORT : 'Port '+ PORT;
  switch (error.code) {
      case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
      case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
      default:
          throw error;
  }
}

function onListening() {
  let addr = server.address();
  let bind = _.isString(addr) ? `pipe ${addr}` : `port ${addr.port}`;
}

// app.listen(port)
// console.log(`Live on port ${port}`)
