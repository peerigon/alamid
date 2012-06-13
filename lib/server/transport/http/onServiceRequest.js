"use strict";

var defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js'),
    alamidRequestAdapter = require("./middleware/alamidRequestAdapter.js");


var middlewares = [
       checkContentType(['application/json']),
       defaultHeaders.setServiceHeader,
       alamidRequestAdapter
];

function onServiceRequest() {
    return middlewares;
}

module.exports = onServiceRequest();

