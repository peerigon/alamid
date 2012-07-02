"use strict";

var recompilePage = require('./middleware/recompilePage.js'),
    defaultHeaders = require('./middleware/defaultHeaders.js');

var middleware = [
    defaultHeaders.setPageHeader,
    recompilePage
];

function onPageRequest() {
   return middleware;
}

module.exports = onPageRequest();