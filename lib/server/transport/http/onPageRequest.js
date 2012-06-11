"use strict";

var servePage = require('../../pages/servePage.js'),
    defaultHeaders = require('./middleware/defaultHeaders.js'),
    iterateMiddlewares = require('../../iterateMiddlewares.js');

var middleware = [
    defaultHeaders.setPageHeader,
    servePage
];

function onPageRequest(req, res, next) {
    iterateMiddlewares(middleware, req, res, next);
}

module.exports = onPageRequest;