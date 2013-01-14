"use strict";

var initServeBundleMiddleware = require("../../../../core/bundle/bundle.js").initServeBundleMiddleware;

var serveBundleMiddleware = null;

function serveBundle(req, res, next) {

    //webpack-middleware skips as well
    if((req.parsedURL.pathname).indexOf("app.js") === -1) {

        next();
        return;
    }

    if(serveBundleMiddleware === null) {
        //init serveBundle, starts webpack and return the actual middleware
        serveBundleMiddleware = initServeBundleMiddleware();
    }

    return serveBundleMiddleware(req, res, next);
}



module.exports = serveBundle;