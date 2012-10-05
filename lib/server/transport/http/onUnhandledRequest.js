"use strict";

var handleDifferentInitPage = require("./middleware/handleDifferentInitPage.js");

var middleware = [
    handleDifferentInitPage
];

function onUnhandledRequest() {
    return middleware;
}

module.exports = onUnhandledRequest();
