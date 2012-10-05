"use strict";

var serveInitPage = require('./serveInitPage');

function handleDifferentInitPage(req, res, next) {
    serveInitPage(req, res, next);
}

module.exports = handleDifferentInitPage;