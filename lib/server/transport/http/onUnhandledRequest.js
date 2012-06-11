"use strict";

var handleDifferentInitPage = require("../../pages/handleDifferentInitPage.js"),
    iterateMiddlewares = require("../../iterateMiddlewares.js");


function pageNotFound(req, res, next){

    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end('Not found. Nothing to do for me.. \n');
}

var middlewares = [
    handleDifferentInitPage,
    pageNotFound
];

function onUnhandledRequest(req, res, next) {
    iterateMiddlewares(middlewares, req, res, next);
}

module.exports = onUnhandledRequest;
