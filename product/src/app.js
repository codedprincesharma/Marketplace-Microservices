const express = require('express');
const cookieParser = require('cookie-parser');
const productRoute = require('../src/routes/product.route')


const app = express();
app.use(cookieParser())
app.use(express.json());




app.use('/api/v1/product', productRoute)


module.exports = app;