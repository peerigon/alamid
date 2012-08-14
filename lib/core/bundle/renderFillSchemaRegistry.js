"use strict"; // run code in ES5 strict mode

var collectSchemas = require("../../core/collect/collectSchemas.js"),
    _ = require("underscore"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(__dirname + "/templates/fillSchemaRegistry.ejs", "utf8"));

function renderFillSchemaRegistry(schemasPath) {
    var schemas = collectSchemas(schemasPath);

    //no server schemas on the client
    delete schemas.server;

    return template({
        collectedSchemas: schemas
    });
}

module.exports = renderFillSchemaRegistry;