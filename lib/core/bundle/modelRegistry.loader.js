"use strict";

var paths = require("../../shared/config").paths,
    renderFillModelRegistry = require("./renderer/renderFillModelRegistry.js");

module.exports = function() {
    this.cacheable();
    return renderFillModelRegistry(paths.root, paths.models);
};