"use strict";

var renderFillPageRegistry = require("./renderer/renderFillPageRegistry.js");

module.exports = function() {
    var config = this.options.alamidConfig;

    this.cacheable();
    return renderFillPageRegistry(config.paths.root, config.paths.pages);
};