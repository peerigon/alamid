"use strict";

var browserify = require("browserify"),
    bypass = require("browserify-bypass"),
    Finder = require("fshelpers").Finder,
    path = require("path");

/**
 * bundles all modules under /shared with browserify for use in the browser
 * @param {!String} sharedPath
 * @param {!Function} callback
 */
function bundleSharedModules(sharedPath, callback) {

    var b = browserify(),
        sharedFinder = new Finder();

    //use bypass middleware to parse conditional comments
    b.use(bypass);

    sharedFinder.on('end', function onSharedFinderEnd(sharedPath, files) {

        for(var i = 0; i < files.length; i++) {
            b.require(files[i]);
        }

        callback(b.bundle());
    });

    sharedFinder.walk(sharedPath);
}

module.exports = bundleSharedModules;