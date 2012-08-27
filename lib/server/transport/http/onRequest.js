"use strict";

var connect = require("connect");

//middlewares
var parseURL = require('./middleware/parseURL.js'),
    setAjaxFlag = require('./middleware/setAjaxFlag.js'),
    serveInitPageShortcut = require('./middleware/serveInitPageShortcut.js');

var middleware = [
        parseURL,
        setAjaxFlag,
        //Maybe add the add another point?
        connect.json(),
        connect.urlencoded(),
        serveInitPageShortcut
    ];

function onRequest() {
    return middleware;
}

module.exports = onRequest();