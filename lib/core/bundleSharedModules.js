"use strict";

var browserify = require("browserify"),
    Finder = require("fshelpers").Finder,
    path = require("path");

function bundleSharedModules(sharedPath, callback) {

    var bundle = browserify(),
        sharedFinder = new Finder();

    bundle.register(".js", function (src) {
        return src.replace(/\/\/ *@browser ([^\n]+)\n(.*)require\(.*\)([^\n]*)/gi, '$2require("$1")$3');
    });

    /*sharedFinder.on('end', function onSharedFinderEnd(sharedPath, files) {

        var activeFileName = null,
            clientFilePath = null,
            serverFilePath;

        //bundle.ignore(path.resolve(sharedPath, "../core/config/config.js"));

        for(var i = 0; i < files.length; i++) {

            activeFileName = path.basename(files[i], ".js");
            clientFilePath = path.resolve(sharedPath, "../client/" + activeFileName + ".client.js");
            serverFilePath = path.resolve(sharedPath, "../core/" + activeFileName + ".server.js");

            if(path.existsSync(serverFilePath)) {
                //clientFilePath = "/compiled/client/" + activeFileName + ".client.js";
                console.log("Found ALIAS: " + clientFilePath);
                //bundle.ignore(serverFilePath);
                //bundle.alias(clientFilePath, serverFilePath);
            }
            //else {

            console.log(files[i]);
            bundle.require(files[i]);
            //}
        }

        //bundle.alias("/compiled/client/logger.client.js", "/compiled/shared/logger.js");
        //bundle.alias("/compiled/client/config.client.js", "/compiled/shared/config.js");

        callback(bundle.bundle());
    });

    sharedFinder.walkSync(sharedPath); */

    //bundle.require(sharedPath + "/logger.js");
    bundle.require(sharedPath + "/config.js");
    callback(bundle.bundle());
}

module.exports = bundleSharedModules;