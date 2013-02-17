"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../../shared/helpers/pathHelpers");

var isServerAndClassFile = pathHelpers.chain.filter("onlyServerFiles", "onlyClassFiles"),
    isClientAndClassFile = pathHelpers.chain.filter("onlyClientFiles", "onlyClassFiles");

function collectServices(servicesPath) {
    var finder = new Finder(),
        services = {
            server: {},
            client: {}
        };

    function onFile(path) {
        var fullPath = path;

        //sanitize the path
        path = pathHelpers.apply.modifier(
            pathHelpers.modifiers.normalizeToUnix
        ).on(path);

        //we only want the model-path without the path to ".../services/"
        path = path.substr(servicesPath.length + 1);
        path = pathHelpers.modifiers.dirname(path).toLowerCase();

        if (isServerAndClassFile(fullPath)) {
            services.server[path] = fullPath;
        }
        else if (isClientAndClassFile(fullPath)) {
            services.client[path] = fullPath;
        }
    }

    function onError(err) {
        throw err;
    }

    finder
        .on("file", onFile)
        .on("error", onError)
        .walkSync(servicesPath);

    return services;
}

module.exports = collectServices;