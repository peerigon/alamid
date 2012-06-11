"use strict";

var runService = require('../../services/runService.js'),
    defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js'),
    iterateMiddlewares = require("../../iterateMiddlewares.js");


var middlewares = [
       checkContentType(['application/json']),
       defaultHeaders.setServiceHeader
       //runService
];


function onServiceRequest(req, res, next) {
    iterateMiddlewares(middlewares, req, res, next);
}

module.exports = onServiceRequest;

// http -> alamid-req-object

// runService(alamid-req-object, alamid-res-object, next)

//


