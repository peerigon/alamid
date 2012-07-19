"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    pathHelpers = require("../shared/helpers/pathHelpers"),
    isServerOnlyAndClassFile = pathHelpers.chain.filter("onlyServerFiles", "onlyClassFiles"),
    isClientOnlyAndClassFile = pathHelpers.chain.filter("onlyClientFiles", "onlyClassFiles");

function collectServices(servicesPath, callback) {
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
            //we store the instances
            var ServerClass = require(fullPath);
            services.server[path] = new ServerClass();
        }
        else if (isClientOnlyAndClassFile(fullPath)) {
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
        .walk(servicesPath);
}

module.exports = collectServices;