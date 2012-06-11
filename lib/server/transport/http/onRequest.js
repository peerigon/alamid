"use strict";

var connect = require("connect"),
    iterateMiddlewares = require('../../iterateMiddlewares.js');

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
    iterateMiddlewares(middleware, req, res, next);
}

module.exports = onRequest;