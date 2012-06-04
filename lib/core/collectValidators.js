"use strict"; // run code in ES5 strict mode

var Finder = require('fshelpers').Finder,
    paths = require('./paths'),
    isServerOnlyAndClassFile = paths.getPathFilterAndModifier(null, [paths.filters.onlyServerFiles, paths.filters.onlyClasses]),
    isClientOnlyAndClassFile = paths.getPathFilterAndModifier(null, [paths.filters.onlyClientFiles, paths.filters.onlyClasses]);

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
        if (isServerOnlyAndClassFile(path)) {
            validators.server[path] = true;
        } else if (isClientOnlyAndClassFile(path)) {
            validators.client[path] = true;
        }
    }

    finder
        .on("file", onFile)
        .on("end", callback)
        .walk(appPaths.validators);
}

module.exports = collectValidators;