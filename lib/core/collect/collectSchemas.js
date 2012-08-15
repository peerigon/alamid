"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    _ = require("underscore"),
    pathHelpers = require("../../shared/helpers/pathHelpers"),
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
            schemas.server[path] = fullPath;
        }
        else if (isClientOnlyAndSchema(fullPath)) {
            schemas.client[path] = fullPath;
        }
        else {
            //in case it's a model used for both
            //create the entries for .server and .client
            //would be overwritten by actual .server and .client files if existent
            if (isSchemaOnly(fullPath)) {

                //we store the shared model as well
                schemas.shared[path] = fullPath;

                if(schemas.server[path] === undefined) {
                    schemas.server[path] = fullPath;
                }

                if(schemas.client[path] === undefined) {
                    schemas.client[path] = fullPath;
                }
            }
        }
    }

    function onError(err) {
        throw err;
    }

    finder
        .on("file", onFile)
        .on("error", onError)
        .walkSync(modelsPath);

    return schemas;
}

module.exports = collectSchemas;