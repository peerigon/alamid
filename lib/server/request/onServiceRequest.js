"use strict";

var runService = require('../services/runService.js'),
    defaultHeaders = require('./defaultHeaders.js'),
    checkContentType = require('./checkContentType.js');


var services = [
       checkContentType(['application/json']),
       defaultHeaders.setServiceHeader,
       runService
];
