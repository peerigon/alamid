"use strict"; // run code in ES5 strict mode

var collectModels = require("../../core/collect/collectModels.js"),
    _ = require("underscore"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(__dirname + "/templates/fillModelRegistry.ejs", "utf8"));

function renderFillModelRegistry(modelsPath) {
    var models = collectModels(modelsPath);

    return template({
        models: models.client
    });
}

module.exports = renderFillModelRegistry;