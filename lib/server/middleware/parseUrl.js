"use strict";

var url = require('url');

function parseURL(req, res, next) {
    req.url = url.parse(req.url, true);
    next();
}

module.exports = parseURL;