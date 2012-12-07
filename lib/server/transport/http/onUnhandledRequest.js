"use strict";

var handleDifferentInitPage = require("./middleware/handleDifferentInitPage.js"),
    notFoundAsset = require("./middleware/notFoundAsset.js");

module.exports = [
    notFoundAsset,
    handleDifferentInitPage
];
