"use strict";

var handleDifferentInitPage = require("./middleware/handleDifferentInitPage.js"),
    pageNotFound = require("./middleware/pageNotFound.js");

var middleware = [
    handleDifferentInitPage,
    pageNotFound
];

function onUnhandledRequest() {
    return middleware;
}

module.exports = onUnhandledRequest();
