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
        console.log("files",files);

        for(var i = 0; i < files.length; i++) {
            b.require(files[i]);
            console.log("in loop:", files[i]);
        }
        callback(b.bundle());
    });

    sharedFinder.walk(sharedPath);

    console.log("logger path: ", sharedPath + "/logger.js");

    /*
    b.require(sharedPath + "/logger.js");
    b.require(sharedPath + "/config.js");
    callback(b.bundle());
    //*/
}

module.exports = bundleSharedModules;