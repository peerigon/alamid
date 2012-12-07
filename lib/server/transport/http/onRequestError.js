"use strict";

var config = require("../../../shared/config");

/**
 * Handler for errors within middleware-pipeline
 * ends the request and returns error-message depending on mode
 * @param err
 * @param req
 * @param res
 */
function onRequestError(err, req, res) {
    if(err) {

        if(config.isDev) {
            console.log(err.stack);
            res.end(err.toString(), "utf-8");
            return;
        }

        res.statusCode = 500;
        res.end("(alamid) Internal Server Error.");
    }
}

module.exports = onRequestError;