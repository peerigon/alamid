"use strict";

var handleDifferentInitPage = require("../pages/handleDifferentInitPage.js"),
    iterateHandlers = require("../iterateHandlers.js");


function pageNotFound(req, res, next){

    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end('Not found. Nothing to do for me.. \n');
    res.end();
}

var unhandled = [
    handleDifferentInitPage,
    pageNotFound
];

function onUnhandledRequest(req, res, next) {
    iterateHandlers(unhandled, req, res, next);
}

module.exports = onUnhandledRequest;
