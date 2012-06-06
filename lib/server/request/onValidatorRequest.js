"use strict";

var runValidator= require('../validators/runValidator.js'),
    defaultHeaders = require('./defaultHeaders.js'),
    checkContentType = require('./checkContentType.js');

var validators = [
    checkContentType(['application/json']),
    defaultHeaders.setValidatorHeader,
    runValidator
];

