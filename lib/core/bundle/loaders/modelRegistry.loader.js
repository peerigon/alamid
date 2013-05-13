"use strict";

var collectModels = require("../../collect/collectModels.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/populateModelRegistry.ejs"), "utf8"));

function modelRegistryLoader() {
    var alamidConfig = this.options.alamidConfig,
        models;

    if (alamidConfig) {
        models = collectModels(alamidConfig.paths.models);

        return template({
            models: models.client
        });
    }

    return "// Cannot generate populateModelRegistry: The webpack options don't have a 'alamidConfig'-property";
}

module.exports = modelRegistryLoader;