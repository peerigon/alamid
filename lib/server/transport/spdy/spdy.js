"use strict";

var spdy = require('spdy');

var options = null;

function initServer(app) {
    return spdy.createServer(options, app);
}

function getOptions() {
    return options;
}

function setOptions(spdyOptions) {
    options = spdyOptions;
}

exports.initServer = initServer;
exports.setOptions = setOptions;
exports.getOptions = getOptions;
