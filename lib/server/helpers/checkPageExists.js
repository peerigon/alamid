"use strict";

var pathUtil = require('path'),
    fs = require("fs"),
    config = require("../../shared/config.js"),
    paths = config.paths;

var pathPrefix = '/pages/';

function checkPageExists(path, callback) {
    if (path.indexOf(pathPrefix) !== 0) {
        path = pathPrefix + path.substr(1);     // remove leading slash
    }
    if (path.charAt(path.length - 1) === '/') {
        path = path.substr(0, path.length - 1);
    }
    if (pathUtil.extname(path) !== '.html') {
        path = path + '.js';
    }
    fs.exists(paths.bundle + path, callback);
}

module.exports = checkPageExists;