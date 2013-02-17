"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../../shared/helpers/pathHelpers");

var isSchemaFile = pathHelpers.chain.filter("onlySchemaFiles"),
    isServerAndSchemaFile = pathHelpers.chain.filter("onlyServerFiles", "onlySchemaFiles"),
    isClientAndSchemaFile = pathHelpers.chain.filter("onlyClientFiles", "onlySchemaFiles");

function collectSchemas(modelsPath) {
    var finder = new Finder(),
        schemas = {
            server: {},
            shared : {},
            client: {}
        };

    function onFile(path) {
        var fullPath = path;

        //sanitize the path
        path = pathHelpers.apply.modifier(
            pathHelpers.modifiers.normalizeToUnix
        ).on(path);

        //we only want the model-path without the path to ".../models/"
        path = path.substr(modelsPath.length + 1);
        path = pathHelpers.modifiers.dirname(path).toLowerCase();

        if (isServerAndSchemaFile(fullPath)) {
            schemas.server[path] = fullPath;
        }
        else if (isClientAndSchemaFile(fullPath)) {
            schemas.client[path] = fullPath;
        }
        else {
            //in case it's a model used for both
            //create the entries for .server and .client
            //would be overwritten by actual .server and .client files if existent
            if (isSchemaFile(fullPath)) {

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