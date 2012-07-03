"use strict";

var pathUtil = require('path'),
    fs = require("fs"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    config = require("../../shared/config.js"),
    paths = config.paths;

var pathPrefix = '/pages/';

function checkPageExists(path, callback) {

    if (path.indexOf(pathPrefix) !== 0) {
        path = pathPrefix + path.substr(1);     // remove leading slash
    }

    //sanitize first
    path = pathHelpers.apply.modifier(
        pathHelpers.modifiers.normalize,
        pathHelpers.modifiers.noTrailingSlash
    ).on(path);

    if (pathUtil.extname(path) !== '.html') {
        path = path + '.js';
    }

    fs.exists(paths.bundle + path, callback);
}

module.exports = checkPageExists;