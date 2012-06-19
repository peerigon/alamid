"use strict";

var browserify = require("browserify"),
    bypass = require("browserify-bypass"),
    Finder = require("fshelpers").Finder,
    path = require("path");

function bundleSharedModules(sharedPath, callback) {

    var b = browserify(),
        sharedFinder = new Finder();

    b.use(bypass);

    sharedFinder.on('end', function onSharedFinderEnd(sharedPath, files) {

        console.log("end");

    });

    sharedFinder.walk(sharedPath);

    //bundle.require(sharedPath + "/logger.js");
    b.require(sharedPath + "/config.js");
    callback(b.bundle());
}

module.exports = bundleSharedModules;