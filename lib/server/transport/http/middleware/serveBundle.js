"use strict";

var config = require("../../../../shared/config"),
    initServeBundleMiddleware = require("../../../../core/bundle/bundle.js").initServeBundleMiddleware;

var serveBundleMiddleware = null;

/**
 * serve the alamid-bundle via webpack-dev-middleware
 * the middleware caches the bundle in memory
 * it re-bundles on file-change via "watch"
 *
 * @param req
 * @param res
 * @param next
 * @return {Function}
 */
function serveBundle(req, res, next) {

    //initialize bundler if not set yet
    if(serveBundleMiddleware === null) {
        //init serveBundle, starts webpack and return the actual middleware
        serveBundleMiddleware = initServeBundleMiddleware(config);
    }

    return serveBundleMiddleware(req, res, next);
}

module.exports = serveBundle;