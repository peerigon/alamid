"use strict";

var collectModels = require("../../collect/collectModels.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/populateModelRegistry.ejs"), "utf8"));

function modelRegistryLoader() {
    var models = collectModels(this.options.alamidConfig.paths.models);

    return template({
        models: models.client
    });
}

module.exports = modelRegistryLoader;