"use strict";

var connect = require("connect"),
    iterateHandlers = require('../iterateHandlers.js');

//middlewares
var parseURL = require('./middleware/parseURL.js'),
    setAjaxFlag = require('./middleware/setAjaxFlag.js'),
    serveInitPageShortcut = require('./middleware/serveInitPageShortcut.js');

var requests = [
        parseURL,
        setAjaxFlag,
        connect.bodyParser(),
        serveInitPageShortcut
    ];

function onRequest(req, res, next) {
    iterateHandlers(requests, req, res, next);
}

module.exports = onRequest;