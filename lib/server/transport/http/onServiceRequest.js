"use strict";

var runService = require('../../services/runService.js'),
    defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js');


var middlewares = [
       checkContentType(['application/json']),
       defaultHeaders.setServiceHeader
       //runService
];


function onServiceRequest() {
    return middlewares;
}

module.exports = onServiceRequest();

// http -> alamid-req-object

// runService(alamid-req-object, alamid-res-object, next)

//


