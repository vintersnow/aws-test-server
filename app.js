const express = require('express');
const http = require('http');
const path = require('path');
const index = require('./routes');
const helmet = require('helmet');
const httpStatus = require('http-status');
const APIError = require('./helpers/APIError');
const config = require('./config');

const app = express();

app.use(helmet());

app.use('/', index);

/**
 * Error
 */

app.use((err, req, res, next) => {
  if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.NOT_FOUND);
  return next(err);
});

// error handler
app.use((err, req, res, next) => {// eslint-disable-line no-unused-vars
  console.error(err);
  res.send('ERROR');
});

/**
 * Listen on provided port, on all network interfaces.
 */

const port = config.port || '3000'
app.set('port', port);

const server = http.createServer(app);


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  // TODO:
  console.error(error);
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
