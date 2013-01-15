"use strict";

var paths = require("../../shared/config").paths,
    renderFillSchemaRegistry = require("./renderer/renderFillSchemaRegistry.js");

module.exports = function() {
    this.cacheable();
    return renderFillSchemaRegistry(paths.root, paths.schemas);
};