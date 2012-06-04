"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    paths = require("./paths"),
    isServerOnlyAndClassFile = paths.getPathFilterAndModifier(["onlyServerFiles", "onlyClasses"], null),
    isClientOnlyAndClassFile = paths.getPathFilterAndModifier(["onlyClientFiles", "onlyClasses"], null);

function collectServices(appPath, callback) {
    var finder = new Finder(),
        appPaths = paths.getPaths(appPath),
        services = {
            server: {},
            client: {}
        };

    function onFile(path) {
        if (isServerOnlyAndClassFile(path)) {
            services.server[path] = true;
        } else if (isClientOnlyAndClassFile(path)) {
            services.client[path] = true;
        }
    }

    function onEnd() {
        callback(null, services);
    }

    function onError(err) {
        finder.reset(); // abort current operation
        callback(err);
    }

    finder
        .on("file", onFile)
        .on("error", onError)
        .on("end", onEnd)
        .walk(appPaths.services);
}

module.exports = collectServices;
