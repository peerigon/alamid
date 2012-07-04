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
            client: {}
        };

    function onFile(path) {

        var fullPath = path,
            ServerClass;

        //we only want the model-path without the path to ".../models"
        path = path.substr(modelsPath.length);

        //and strip slash at the beginning
        if(path.charAt(0) === "/") {
            path = path.substr(1);
        }

        if (isServerOnlyAndClassFile(path)) {
            //we store the instances
            ServerClass = require(fullPath);
            models.server[path] = new ServerClass();
        }
        else if (isClientOnlyAndClassFile(path)) {
            models.client[path] = true;
        }
        else {
            //in case it's a model used for both
            //create the entries for .server and .client
            //would be overwritten by actual .server and .client files if existent
            if (isOnlyClassFile(path)) {
                //remove the generic .class.js ending
                path = path.substr(0, path.length - ".class.js".length);

                if(models.server[path + ".server.class.js"] === undefined) {
                    ServerClass = require(fullPath);
                    models.server[path + ".server.class.js"] = new ServerClass();
                }

                if(models.client[path + ".client.class.js"] === undefined) {
                    models.client[path + ".client.class.js"] = true;
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