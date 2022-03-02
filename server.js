require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');
const port = process.env.PORT || 3000;

require('./app_api/models/db');

const apiRouter = require(path.join(__dirname, 'app_api', 'routes', 'index'));

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use('/', apiRouter);

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});