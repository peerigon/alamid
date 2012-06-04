"use strict"; // run code in ES5 strict mode

var Finder = require('fshelpers').Finder,
    paths = require('./paths');

/**
 * collect all validators
 * @param appPath {!String}
 * @param callback {!Function}
 */
function collectValidators(appPath, callback) {

    var finder = new Finder(),
        appPaths = paths.getPaths(appPath),
        validators = {
            server: {},
            client: {}
        };

    function onFile(path) {
        if (paths.filters.onlyServerFiles(path)) {
            validators.server[path] = true;
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

    finder
        .on("file", onFile)
        .on("error", onError)
        .on("end", onEnd)
        .walk(appPaths.validators);
}

module.exports = collectValidators;