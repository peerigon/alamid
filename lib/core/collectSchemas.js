"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../shared/helpers/pathHelpers"),
    isSchemaOnly = pathHelpers.chain.filter("onlySchemaFiles"),
    isServerOnlyAndSchema = pathHelpers.chain.filter("onlyServerFiles", "onlySchemaFiles"),
    isClientOnlyAndSchema = pathHelpers.chain.filter("onlyClientFiles", "onlySchemaFiles");

function collectSchemas(modelsPath, callback) {
    var finder = new Finder(),
        schemas = {
            server: {},
            shared : {},
            client: {}
        };

    function onFile(path) {

        var fullPath = path,
            pathSplit;

        //we only want the model-path without the path to ".../models"
        path = path.substr(modelsPath.length);

        //and strip slash at the beginning
        if(path.charAt(0) === "/") {
            path = path.substr(1);
        }

        //we only want the path without fs-specific stuff
        pathSplit = path.split("/");
        pathSplit.pop();

        path = pathSplit.join("/");
        path = path.toLowerCase();

        if (isServerOnlyAndSchema(fullPath)) {
            schemas.server[path] = require(fullPath);
        }
        else if (isClientOnlyAndSchema(fullPath)) {
            //remove the fs-specific ending
            schemas.client[path] = require(fullPath);
        }
        else {
            //in case it's a model used for both
            //create the entries for .server and .client
            //would be overwritten by actual .server and .client files if existent
            if (isSchemaOnly(fullPath)) {

                var schemaDefinition = require(fullPath);

                //we store the shared model as well
                schemas.shared[path] = schemaDefinition;

                if(schemas.server[path] === undefined) {
                    schemas.server[path] = schemaDefinition;
                }

                if(schemas.client[path] === undefined) {
                    schemas.client[path] = true;
                }
            }
        }
    }

    function onEnd() {
        callback(null, schemas);
    }

    function onError(err) {
        finder.reset(); // abort current operation
        callback(err);
    }

    finder
        .on("file", onFile)
        .on("error", onError)
        .on("end", onEnd)
        .walk(modelsPath);
}

module.exports = collectSchemas;