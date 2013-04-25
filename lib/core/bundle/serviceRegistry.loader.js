"use strict";

var paths = require("../../shared/config").paths,
    renderFillServicesRegistry = require("./renderer/renderFillServiceRegistry.js");

module.exports = function() {
    var config = this.options.alamidConfig;

    this.cacheable();
    return renderFillServicesRegistry(config.paths.root, config.paths.services);
};