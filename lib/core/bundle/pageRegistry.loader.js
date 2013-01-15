"use strict";

var paths = require("../../shared/config").paths,
    renderFillPageRegistry = require("./renderer/renderFillPageRegistry.js");

module.exports = function() {
    this.cacheable();
    return renderFillPageRegistry(paths.root, paths.pages);
};