"use strict";

var handleDifferentInitPage = require("./middleware/handleDifferentInitPage.js"),
    notFoundAsset = require("./middleware/notFoundAsset.js");

var middleware = [
    notFoundAsset,
    handleDifferentInitPage
];

function onUnhandledRequest() {
    return middleware;
}

module.exports = onUnhandledRequest();
