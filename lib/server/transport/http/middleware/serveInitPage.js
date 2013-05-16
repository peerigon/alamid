"use strict";

var fs = require("fs"),
    config = require("../../../../shared/config.js"),
    Bundler = require("../../../../core/bundle/Bundler.class.js"),
    paths = config.paths,
    env = require("../../../../shared/env.js");

var bundler = Bundler.getInstance();

function serveInitPage(req, res, next) {

    var initPagePath = paths.bundle + "/index.html",
        bundleStats = bundler.stats;

    function serve(err) {
        if (err) {
            next("(alamid) Error with bundle-creation: " + err.message);
            return;
        }

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        fs.createReadStream(initPagePath).pipe(res); // awesome piping
    }

    // check if bundle was already created in production-mode
    // if it doesn't exist, we regenerate
    if (!bundleStats && env.isProduction() && config.use.bundle === true) {
         bundler.createBundle(serve);
    } else {
        serve();
    }
}

module.exports = serveInitPage;