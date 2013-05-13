"use strict";

var fs = require("fs"),
    config = require("../../../../shared/config.js"),
    Bundler = require("../../../../core/bundle/Bundler.class.js"),
    paths = config.paths,
    env = require("../../../../shared/env.js");

var bundleExists = false,
    bundler;

function serveInitPage(req, res, next) {

    var initPagePath = paths.bundle + "/index.html";

    function serve() {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        fs.createReadStream(initPagePath).pipe(res); // awesome piping
    }

    // check if bundle was already created in production-mode
    // if it doesn't exist, we regenerate
    if (bundleExists === false && env.isProduction() && config.use.bundle === true) {
        //does the main app.js exist? we assume lazy-bundles will exist if app.js is there
        fs.exists(paths.bundle + "/statics/app.js", function (exists) {
            if (exists) {
                bundleExists = true;
                serve();
            }
            else {
                bundler = new Bundler();
                bundler.createBundle(function (err) {

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