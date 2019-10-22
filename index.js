const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const config = require('./config');
const cookieParser = require('cookie-parser');

app.use('/public', express.static('public'));

app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    name: 'sid',
    secret: config.JWT_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  })
);
// bottom for form submissions
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/api/authRoutes'));

app.listen(config.PORT, () => {
  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });
});

const db = mongoose.connection;

db.on('error', err => console.log(err));

db.once('open', () => {
  console.log(`Listening on port ${config.PORT}...`);
});
