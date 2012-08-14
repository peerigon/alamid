"use strict"; // run code in ES5 strict mode

var collectSchemas = require("../../core/collect/collectSchemas.js"),
    _ = require("underscore"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(__dirname + "/templates/fillSchemaRegistry.ejs", "utf8"));

function renderFillSchemaRegistry(schemasPath) {
    var schemas = collectSchemas(schemasPath);

    return template({
        schemas: schemas
    });
}

module.exports = renderFillSchemaRegistry;