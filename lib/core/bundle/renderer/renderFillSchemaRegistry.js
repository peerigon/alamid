"use strict"; // run code in ES5 strict mode

var collectSchemas = require("../../collect/collectSchemas.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/fillSchemaRegistry.ejs"), "utf8"));

function renderFillSchemaRegistry(rootPath, schemasPath) {

    var schemas = collectSchemas(schemasPath);

    //no server schemas on the client
    delete schemas.server;

    return template({
        rootPath : rootPath,
        collectedSchemas: schemas
    });
}

module.exports = renderFillSchemaRegistry;