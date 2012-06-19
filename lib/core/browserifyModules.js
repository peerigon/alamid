"use strict";

var browserify = require("browserify"),
    bypass = require("browserify-bypass"),
    Finder = require("fshelpers").Finder,
    path = require("path");

/**
 * convert all modules for browser-usage. Use absolute paths here!
 * @param {!String} path
 * @param {!Function} callback
 */
function browserifyModules(path, callback) {

    var b = browserify(),
        finder = new Finder();

    //use bypass middleware to parse conditional comments
    b.use(bypass);

    finder.on('end', function onFinderEnd(path, files) {

        for(var i = 0; i < files.length; i++) {
            b.require(files[i]);
        }

        callback(b.bundle());
    });

    finder.walk(path);
}

module.exports = browserifyModules;