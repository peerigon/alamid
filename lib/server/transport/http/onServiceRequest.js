"use strict";

var defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js'),
    httpAdapter = require("./middleware/httpAdapter.js");


var middlewares = [
       checkContentType(['application/json']),
       defaultHeaders.setServiceHeader,
       httpAdapter
];

function onServiceRequest() {
    return middlewares;
}

module.exports = onServiceRequest();

