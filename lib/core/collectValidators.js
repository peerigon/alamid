"use strict"; // run code in ES5 strict mode

var Finder = require("fshelpers").Finder,
    paths = require("../shared/helpers/pathHelpers"),
    unitTestLeaks = {};

/**
 * collect all validators
 * @param validatorsPath {!String}
 * @param callback {!Function}
 */
function collectValidators(validatorsPath, callback) {

    var finder = new Finder(),
        validators = {
            server: {},
            client: {}
        };

    function onFile(path) {

        var fullPath = path;
        //we only want the services not the full path
        path = path.substr(validatorsPath.length);

        //and strip slash at the beginning
        if(path.charAt(0) === "/") {
            path = path.substr(1);
        }

        if (paths.filters.onlyServerFiles(path)) {
            validators.server[path] = require(fullPath);
        } else if (paths.filters.onlyClientFiles(path)) {
            validators.client[path] = true;
        }
    }

    function onEnd() {
        callback(null, validators);
    }

    function onError(err) {
        finder.reset();
        callback(err);
    }

    unitTestLeaks.finder = finder;

    finder
        .on("file", onFile)
        .on("error", onError)
        .on("end", onEnd)
        .walk(validatorsPath);
}

module.exports = collectValidators;