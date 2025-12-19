import createError from 'http-errors';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import userApiRouter from './routes/api/users.js';

import indexRouter from './routes/index.js';
import { initializeWebSocket } from './lib/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// sessions
app.use(session({
  secret: 'tp-express-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // ça fait beaoucoup de temps
}));

// make user available in all templates
app.use(function(req, res, next) {
  res.locals.user = req.session && req.session.user ? req.session.user : null;
  next();
});

app.use('/', indexRouter);

// API routes (users)
app.use('/api/users', userApiRouter);

// catch 404 and forward to error handler (custom 404 page)
app.use(function(req, res, next) {
  res.status(404);
  res.render('404', { url: req.originalUrl });
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', { message: err.message, error: req.app.get('env') === 'development' ? err : {} });
});

// Socket.IO
initializeWebSocket(io);

// Start server on port 8080
const port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('Server listening on port ' + port);
  console.log('Visit http://localhost:' + port + '/ in your browser');
});

export { app, io };
