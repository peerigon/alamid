"use strict";

var isFile = /\.[a-z]{2,4}$/i;

function resourceNotFound(req, res, next){
    res.writeHead(404, {"Content-Type": "text/html"});
    res.end("Static File not found: '" + req.parsedURL.pathname + "' \n");
}

/**
 * we respond with 404 if the path is an asset-path
 * if it's no asset, we next, so the index.html will be returned
 * @param req
 * @param res
 * @param next
 */
function notFoundAsset(req, res, next) {

    var parsedURL = req.parsedURL;

    //check for assets folder and all requests containing a "." for file extensions
    if (isFile.test(parsedURL.pathname)) {
        resourceNotFound(req, res, next);
        return;
    }

    next();
}

module.exports = notFoundAsset;

