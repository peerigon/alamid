"use strict"; // run code in ES5 strict mode

var collectModels = require("../../collect/collectModels.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/fillModelRegistry.ejs"), "utf8"));

function renderFillModelRegistry(rootPath, modelPath) {

    var models = collectModels(modelPath);

    return template({
        rootPath : rootPath,
        models: models.client
    });
}

module.exports = renderFillModelRegistry;