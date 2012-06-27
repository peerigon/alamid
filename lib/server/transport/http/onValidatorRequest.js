"use strict";

var  defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js'),
    httpAdapter = require("./middleware/httpAdapter.js");

var middleware = [
    checkContentType(['application/json']),
    defaultHeaders.setValidatorHeader,
    httpAdapter
];

function onValidatorRequest() {
    return middleware;
}

module.exports = onValidatorRequest();