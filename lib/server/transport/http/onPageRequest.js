"use strict";

var servePage = require('../../request/middleware/servePage.js'),
    defaultHeaders = require('./middleware/defaultHeaders.js');

var middleware = [
    defaultHeaders.setPageHeader,
    servePage
];

function onPageRequest() {
   return middleware;
}


module.exports = onPageRequest();