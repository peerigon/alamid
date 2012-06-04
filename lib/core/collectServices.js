"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    paths = require("./paths"),
    isServerOnlyAndClassFile = paths.getPathFilterAndModifier(null, [paths.filters.onlyServerFiles, paths.filters.onlyClasses]),
    isClientOnlyAndClassFile = paths.getPathFilterAndModifier(null, [paths.filters.onlyClientFiles, paths.filters.onlyClasses]);

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

    finder
        .on("file", onFile)
        .on("end", callback)
        .walk(appPaths.services);
}

module.exports = collectServices;
