"use strict";

var paths = require("../../shared/config").paths,
    renderFillServicesRegistry = require("./renderer/renderFillServiceRegistry.js");

module.exports = function() {
    this.cacheable();
    return renderFillServicesRegistry(paths.root, paths.services);
};