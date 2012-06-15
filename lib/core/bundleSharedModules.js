"use strict";

var browserify = require("browserify"),
    Finder = require("fshelpers").Finder,
    path = require("path");

function bundleSharedModules(sharedPath, callback) {

    var bundle = browserify({ debug : true }),
        sharedFinder = new Finder();

    sharedFinder.on('end', function onSharedFinderEnd(sharedPath, files) {

        var activeFileName = null,
            clientFilePath = null,
            serverFilePath;

        bundle.ignore(path.resolve(sharedPath, "../core/config/config"));

        for(var i = 0; i < files.length; i++) {

            activeFileName = path.basename(files[i], ".js");
            clientFilePath = path.resolve(sharedPath, "../client/" + activeFileName + ".client.js");
            serverFilePath = path.resolve(sharedPath, "../core/" + activeFileName + ".server.js");

            if(path.existsSync(clientFilePath)) {
                clientFilePath = "/compiled/client/" + activeFileName + ".client.js";
                bundle.ignore("winston");
                console.log("Found ALIAS: " + clientFilePath);
                //bundle.alias(clientFilePath, files[i]);
            }
            //else {


                bundle.require(files[i]);
            //}
        }



        bundle.alias("/compiled/client/logger.client.js", "/compiled/shared/logger.js");
        bundle.alias("/compiled/client/config.client.js", "/compiled/shared/config.js");


        callback(bundle.bundle());
    });

    sharedFinder.walk(sharedPath);
}

module.exports = bundleSharedModules;