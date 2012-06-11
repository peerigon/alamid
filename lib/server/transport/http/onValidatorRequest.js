"use strict";

var runValidator= require('../../validators/runValidator.js'),
    defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js');

var middleware = [
    checkContentType(['application/json']),
    defaultHeaders.setValidatorHeader
    //runValidator
];

function onValidatorRequest() {
    middleware;
}

module.exports = onValidatorRequest();