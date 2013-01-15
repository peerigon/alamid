"use strict";

var config = require('../../../../core/config'),
    runCreateBundle = require("../../../../core/bundle/runCreateBundle.js"),
    paths = config.paths,
    fs = require('fs');

var bundleExists = false;

function serveInitPage(req, res, next) {

    var initPagePath = paths.bundle + '/index.html';

    function serve() {
        fs.readFile(initPagePath, function onFileRead(err, data) {
            if(err) {
                throw new Error("(alamid) No index.html file defined at '" + initPagePath + "'");
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(data);
        });
    }

    //check if bundle was already created in production-mode
    //if it doesn't exist, we regenerate
    if(bundleExists === false && config.mode === "production" && config.useBundling === true && (req.parsedURL.pathname).indexOf(".app") === -1) {
        //does the main app.js exist? we assume lazy-bundles will exist if app.js is there
        fs.exists(paths.bundle + "/app.js", function (exists) {
            if(exists) {
                bundleExists = true;
                serve();
            }
            else {
                //update bundle
                runCreateBundle(config, function(err) {

                    if(err) {
                        next("(alamid) Error with bundle-creation: " + err.message);
                        return;
                    }

                    serve();
                });
            }
        });
    }
    else {
        serve();
    }
}

module.exports = serveInitPage;