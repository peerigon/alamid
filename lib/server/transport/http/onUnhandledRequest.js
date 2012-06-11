"use strict";

var handleDifferentInitPage = require("../../pages/handleDifferentInitPage.js"),
    pageNotFound = require("./middleware/pageNotFound.js");



var middleware = [
    handleDifferentInitPage,
    pageNotFound
];

function onUnhandledRequest() {
    return middleware;
}

module.exports = onUnhandledRequest();
