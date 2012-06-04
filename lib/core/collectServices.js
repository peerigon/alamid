"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    paths = require("./paths");

function collectServices(appPath, callback) {
    var finder = new Finder(),
        appPaths = paths.getPaths(appPath),
        services = {
            server: {},
            client: {}
        };

    function onFile(path) {
        if (paths.filters.onlyServerFiles(path)) {
            services.server[path] = true;
        } else if (paths.filters.onlyClientFiles(path)) {
            services.client[path] = true;
        }
    }

    finder
        .on("file", onFile)
        .on("end", callback)
        .walk(appPaths.services);
}

module.exports = collectServices;
