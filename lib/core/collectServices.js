"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    paths = require("../helpers/paths"),
    appPaths = require("./config").paths,
    isServerOnlyAndClassFile = paths.use.filters(paths.filters.onlyServerFiles, paths.filters.onlyClasses),
    isClientOnlyAndClassFile = paths.use.filters(paths.filters.onlyClientFiles, paths.filters.onlyClasses),
    unitTestLeaks = {};

function collectServices(appPath, callback) {
    var finder = new Finder(),
        services = {
            server: {},
            client: {}
        };

    function onFile(path) {

        //we only want /services without the shizzle before
        path = path.substr(0, appPath.length);

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

    unitTestLeaks.finder = finder;

    finder
        .on("file", onFile)
        .on("error", onError)
        .on("end", onEnd)
        .walk(appPaths.services);
}

module.exports = collectServices;