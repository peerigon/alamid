"use strict";

var paths = require("../../shared/config").paths,
    renderFillServicesRegistry = require("./renderer/renderFillServiceRegistry.js");

module.exports = renderFillServicesRegistry(paths.root, paths.services);