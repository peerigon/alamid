"use strict"; // run code in ES5 strict mode

var collectPages = require("../../core/collect/collectPages.js"),
    config = require("../../shared/config.js");

function writeClientRegistries() {
    var pages = collectPages(config.paths.pages);


}

module.exports = writeClientRegistries;