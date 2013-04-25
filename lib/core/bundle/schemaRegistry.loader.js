"use strict";

var paths = require("../../shared/config").paths,
    renderFillSchemaRegistry = require("./renderer/renderFillSchemaRegistry.js");

module.exports = function() {
    var config = this.options.alamidConfig;

    this.cacheable();
    return renderFillSchemaRegistry(config.paths.root, config.paths.schemas);
};