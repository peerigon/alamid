"use strict";

var runService = require('../services/runService.js'),
    defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js');


var services = [
       checkContentType(['application/json']),
       defaultHeaders.setServiceHeader,
       runService
];
