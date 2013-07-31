"use strict";

var fs = require("fs"),
    config = require("../../../../shared/config.js"),
    paths = config.paths,
    env = require("../../../../shared/env.js");

/**
 * serve the init page
 * defaults to bundle.path / index.html
 *
 * @param req
 * @param res
 * @param next
 */
function serveInitPage(req, res, next) {

    var initPagePath = paths.bundle + "/index.html";
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    fs.createReadStream(initPagePath).pipe(res); // awesome piping
}

module.exports = serveInitPage;