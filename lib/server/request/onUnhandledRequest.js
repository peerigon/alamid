"use strict";

var handleDifferentInitPage = require('../pages/handleDifferentInitPage.js');

var unhandled = [
    handleDifferentInitPage
];

function onUnhandledRequest(req, res, next) {
    iterateHandlers(unhandled, req, res, next);
}

module.exports = onUnhandledRequest;
