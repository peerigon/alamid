"use strict";

var handleDifferentInitPage = require("./middleware/handleDifferentInitPage.js"),
    resourceNotFound = require("./middleware/resourceNotFound.js");

var middleware = [
    handleDifferentInitPage,
    resourceNotFound
];

function onUnhandledRequest() {
    return middleware;
}

module.exports = onUnhandledRequest();
