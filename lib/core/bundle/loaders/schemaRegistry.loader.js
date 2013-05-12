"use strict"; // run code in ES5 strict mode

var collectSchemas = require("../../collect/collectSchemas.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/populateSchemaRegistry.ejs"), "utf8"));

function schemaRegistryLoader() {
    var schemas = collectSchemas(this.options.alamidConfig.paths.models);

    return template({
        schemas: schemas
    });
}

module.exports = schemaRegistryLoader;