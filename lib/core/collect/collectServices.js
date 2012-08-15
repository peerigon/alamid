"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../../shared/helpers/pathHelpers"),
    isServerOnlyAndClassFile = pathHelpers.chain.filter("onlyServerFiles", "onlyClassFiles"),
    isClientOnlyAndClassFile = pathHelpers.chain.filter("onlyClientFiles", "onlyClassFiles");

function collectServices(servicesPath) {
    var finder = new Finder(),
        services = {
            server: {},
            client: {}
        };

    function onFile(path) {

        var fullPath = path,
            pathSplit;

        //we only want the services not the full path
        path = path.substr(servicesPath.length);

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
            services.server[path] = fullPath;
        }
        else if (isClientOnlyAndClassFile(fullPath)) {
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