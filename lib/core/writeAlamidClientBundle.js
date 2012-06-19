"use strict";

var config = require("./config"),
    async = require("async"),
    browserifyModules = require("./browserifyModules.js"),
    path = require("path"),
    fs = require("fs");


function writeAlamidClientBundleFile(bundleContent, filePath, callback) {

    fs.writeFile(filePath, bundleContent, function (err) {
        if (err) {
            callback(err);
            return;
        }

        callback(null);
    });
}

function writeAlamidClientBundle(mainCallback) {

    var bundle = "";

    function browserifyShared(callback){
        browserifyModules(path.resolve(__dirname, "../shared"), function bundleSharedFiles(bundledFiles) {
            bundle += bundledFiles;
            callback();
        });
    }

    function browserifyClient(callback){
        browserifyModules(path.resolve(__dirname, "../client"),  function bundleClientFiles(bundledFiles) {
            bundle += bundledFiles;
            callback();
        });
    }

    async.parallel([
        browserifyClient,
        browserifyShared
    ], function (err, result) {
        // result now equals 'done'
        writeAlamidClientBundleFile(bundle, config.paths.bundle + "/alamidClientBundle.js", mainCallback);
    });
}

module.exports = writeAlamidClientBundle;