"use strict";

var connect = require("connect");

//middlewares
var parseURL = require('./middleware/parseURL.js'),
    serveInitPageShortcut = require('./middleware/serveInitPageShortcut.js');

module.exports = [
    parseURL,
    //Maybe @ another point?
    connect.json(),
    connect.urlencoded(),
    serveInitPageShortcut
];