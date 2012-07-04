"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../shared/helpers/pathHelpers"),
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

        var fullPath = path;

        //we only want the services not the full path
        path = path.substr(modelsPath.length);

        //and strip slash at the beginning
        if(path.charAt(0) === "/") {
            path = path.substr(1);
        }

        if (isServerOnlyAndClassFile(path)) {
            //we store the instances
            var ServerClass = require(fullPath);
            models.server[path] = new ServerClass();
        } else if (isClientOnlyAndClassFile(path)) {
            models.client[path] = true;
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