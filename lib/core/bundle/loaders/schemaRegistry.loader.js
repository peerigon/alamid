"use strict"; // run code in ES5 strict mode

var collectSchemas = require("../../collect/collectSchemas.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/populateSchemaRegistry.ejs"), "utf8"));

function schemaRegistryLoader() {
    var alamidConfig = this.options.alamidConfig,
        schemas;

    if (alamidConfig) {
        schemas = collectSchemas(alamidConfig.paths.schemas);

        return template({
            schemas: schemas
        });
    }

    return "// Cannot generate populateSchemaRegistry: The webpack options don't have a 'alamidConfig'-property";
}

module.exports = schemaRegistryLoader;