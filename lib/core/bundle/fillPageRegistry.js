"use strict";

var paths = require("../../shared/config").paths,
    renderFillPageRegistry = require("./renderer/renderFillPageRegistry.js");

module.exports = renderFillPageRegistry(paths.root, paths.pages);