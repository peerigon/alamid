"use strict";

var defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js'),
    httpAdapter = require("./middleware/httpAdapter.js");

module.exports = [
    checkContentType(['application/json']),
    defaultHeaders.setValidatorHeader,
    httpAdapter
];