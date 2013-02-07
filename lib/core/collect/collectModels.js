"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../../shared/helpers/pathHelpers"),
    isOnlyClassFile = pathHelpers.chain.filter("onlyClassFiles"),
    isServerOnlyAndClassFile = pathHelpers.chain.filter("onlyServerFiles", "onlyClassFiles"),
    isClientOnlyAndClassFile = pathHelpers.chain.filter("onlyClientFiles", "onlyClassFiles");

function collectModels(modelsPath) {
    var finder = new Finder(),
        models = {
            server: {},
            shared : {},
            client: {}
        };

    function onFile(path) {
        var fullPath;

        //sanitize the path
        path = pathHelpers.apply.modifier(
            pathHelpers.modifiers.normalizeToUnix
        ).on(path);

        fullPath = path;

        //we only want the model-path without the path to ".../models/"
        path = path.substr(modelsPath.length + 1);
        path = pathHelpers.modifiers.dirname(path).toLowerCase();

        if (isServerOnlyAndClassFile(fullPath)) {
            models.server[path] = fullPath;
        }
        else if (isClientOnlyAndClassFile(fullPath)) {
            models.client[path] = fullPath;
        }
        else {
            //in case it's a model used for both
            //create the entries for .server and .client
            //would be overwritten by actual .server and .client files if existent
            if (isOnlyClassFile(fullPath)) {
                //we store the shared model as well
                models.shared[path] = fullPath;

                if(models.server[path] === undefined) {
                    models.server[path] = fullPath;
                }

                if(models.client[path] === undefined) {
                    models.client[path] = fullPath;
                }
            }
        }
    }

    function onError(err) {
        finder.reset(); // abort current operation
        throw err;
    }

    finder
        .on("file", onFile)
        .on("error", onError)
        .walkSync(modelsPath);

    return models;
}

module.exports = collectModels;