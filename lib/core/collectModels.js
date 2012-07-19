"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../shared/helpers/pathHelpers"),
    isOnlyClassFile = pathHelpers.chain.filter("onlyClassFiles"),
    isServerOnlyAndClassFile = pathHelpers.chain.filter("onlyServerFiles", "onlyClassFiles"),
    isClientOnlyAndClassFile = pathHelpers.chain.filter("onlyClientFiles", "onlyClassFiles"),
    unitTestLeaks = {};

function collectModels(modelsPath, callback) {
    var finder = new Finder(),
        models = {
            server: {},
            shared : {},
            client: {}
        };

    function onFile(path) {

        var fullPath = path,
            ServerClass,
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

        if (isServerOnlyAndClassFile(fullPath)) {
            //we store the instances
            ServerClass = require(fullPath);
            //remove the fs-specific ending
            models.server[path] = new ServerClass();
        }
        else if (isClientOnlyAndClassFile(fullPath)) {
            //remove the fs-specific ending
            models.client[path] = true;
        }
        else {
            //in case it's a model used for both
            //create the entries for .server and .client
            //would be overwritten by actual .server and .client files if existent
            if (isOnlyClassFile(fullPath)) {
                ServerClass = require(fullPath);

                //we store the shared model as well
                models.shared[path] = ServerClass;

                if(models.server[path] === undefined) {
                    models.server[path] = ServerClass;
                }

                if(models.client[path] === undefined) {
                    models.client[path] = true;
                }
            }
        }
    }

    function onEnd() {
        callback(null, models);
    }

    function onError(err) {
        finder.reset(); // abort current operation
        callback(err);
    }

    unitTestLeaks.finder = finder;

    finder
        .on("file", onFile)
        .on("error", onError)
        .on("end", onEnd)
        .walk(modelsPath);
}

module.exports = collectModels;