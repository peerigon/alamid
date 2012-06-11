"use strict";

var connect = require("connect");

//middlewares
var parseURL = require('./middleware/parseURL.js'),
    setAjaxFlag = require('./middleware/setAjaxFlag.js'),
    serveInitPageShortcut = require('./middleware/serveInitPageShortcut.js');

var middleware = [
        parseURL,
        setAjaxFlag,
        connect.bodyParser(),
        serveInitPageShortcut
    ];

function onRequest(req, res, next) {
    return middleware;
}

module.exports = onRequest();