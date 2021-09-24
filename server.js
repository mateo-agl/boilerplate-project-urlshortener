require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const ObjModel = require('./myApp.js').ObjModel;
const createShortUrl = require('./myApp.js').createAndSaveShortUrl;
const findDocument = require('./myApp.js').findDocument;

app.post('/api/shorturl', (req, res, next) => {
  const hostname = req.body.url.split('/')[2];
  dns.lookup(hostname, (err, addresses, family) => {
    if (err) return console.error(err);
    if (!addresses) return res.json({error: 'invalid url'});
    next();
  });
},
(req, res, next) => {
  findDocument(req.body.url, (err, doc) => {
    if (err) return console.error(err);
    if (doc) return res.json({original_url: doc.original_url, short_url: doc.short_url});
    next();
  });
},
(req, res, next) => {
  ObjModel.countDocuments((err, count) => {
    if (err) return console.error(err);
    req.num = count + 1;
    next();
  });
},
(req, res) => {
  createShortUrl(req.body.url, req.num, (err, doc) => {
    if (err) return console.error(err);
    res.json({original_url: doc.original_url, short_url: doc.short_url});
  });
});

app.get('/api/shorturl/:num', (req, res, next) => {
  findDocument(req.params.num, (err, doc) => {
    if (err) return console.error(err);
    if (doc) res.redirect(doc.original_url);
  });
});