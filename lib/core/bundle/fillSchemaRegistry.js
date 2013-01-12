"use strict";

var paths = require("../../shared/config").paths,
    renderFillSchemaRegistry = require("./renderer/renderFillSchemaRegistry.js");

module.exports = renderFillSchemaRegistry(paths.root, paths.schemas);