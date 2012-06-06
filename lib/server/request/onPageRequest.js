"use strict";

var servePage = require('../pages/servePage.js'),
    defaultHeaders = require('./defaultHeaders.js');

var pages = [
    defaultHeaders.setPageHeader,
    servePage
];