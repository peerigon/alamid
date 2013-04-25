"use strict";

var paths = require("../../shared/config").paths,
    renderFillModelRegistry = require("./renderer/renderFillModelRegistry.js");

module.exports = function() {
    var config = this.options.alamidConfig;

    this.cacheable();
    return renderFillModelRegistry(config.paths.root, config.paths.models);
};