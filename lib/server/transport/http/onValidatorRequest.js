"use strict";

var runValidator= require('../../validators/runValidator.js'),
    defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js'),
    iterateMiddlewares = require("../../iterateMiddlewares.js");

var middlewares = [
    checkContentType(['application/json']),
    defaultHeaders.setValidatorHeader,
    runValidator
];

function onValidatorRequest(req, res, next) {
    iterateMiddlewares(middlewares, req, res, next);
}

module.exports = onValidatorRequest;