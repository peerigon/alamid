"use strict";

var fs = require('fs'),
    config = require('../../../../shared/config.js'),
    paths = config.paths,
    env = require("../../../../shared/env.js");

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
    if(bundleExists === false && env.isProduction() && config.use.bundle === true && (req.parsedURL.pathname).indexOf(".app") === -1) {
        //does the main app.js exist? we assume lazy-bundles will exist if app.js is there
        fs.exists(paths.bundle + "/app.js", function (exists) {
            if(exists) {
                bundleExists = true;
                serve();
            }
            else {
                //update bundle
                bundle.createBundle(config, function(err) {

                    if (err) {
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