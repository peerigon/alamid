"use strict";

var paths = require("../../shared/config").paths,
    renderFillModelRegistry = require("./renderer/renderFillModelRegistry.js");

module.exports = renderFillModelRegistry(paths.root, paths.models);