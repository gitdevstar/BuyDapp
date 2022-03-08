
const express = require('express'),
    cors = require('cors'),
    compression = require('compression'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    db = require('./db'),
    api = require('./api');

const port = process.env.PORT || 8001,
    host = process.env.HOST || "localhost";

const app = express();

app.use(cors())
app.use(compression())
app.use(morgan('dev'))
app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/api', api);
// app.use('./db', db);

app.listen(port, host);

console.log('server listening on http://%s:%d', host, port)