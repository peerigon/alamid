"use strict";

var defaultHeaders = require('./middleware/defaultHeaders.js');

var middleware = [
    defaultHeaders.setPageHeader
];

function onPageRequest() {
   return middleware;
}

module.exports = onPageRequest();