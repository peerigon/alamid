"use strict";

var connect = require("connect"),
    logger = connect.logger(":method :url :status - :response-time ms");

var config = require("../../../shared/config"),
    paths = config.paths;

var parseURL = require('./middleware/parseURL.js'),
    serveInitPageShortcut = require('./middleware/serveInitPageShortcut.js'),
    handleDifferentInitPage = require("./middleware/handleDifferentInitPage.js"),
    notFoundAsset = require("./middleware/notFoundAsset.js"),
    staticFileHandler = require("./middleware/staticFileHandler.js"),
    defaultHeaders = require('./middleware/defaultHeaders.js'),
    checkContentType = require('./middleware/checkContentType.js'),
    httpAdapter = require("./middleware/httpAdapter.js"),
    serveBundle = require("./middleware/serveBundle.js");

//ON REQUEST
exports.request = [
    parseURL,
    connect.json(),
    connect.urlencoded(),
    serveInitPageShortcut
];

//SERVICE REQUEST
exports.serviceRequest = [
    checkContentType(['application/json']),
    defaultHeaders.setServiceHeader,
    httpAdapter
];

//VALIDATOR REQUEST
exports.validatorRequest = [
    checkContentType(['application/json']),
    defaultHeaders.setValidatorHeader,
    httpAdapter
];


//STATIC REQUEST
var staticRequestMiddleware = [
    staticFileHandler
];

function staticRequest() {

    if(config.isDev) {
        staticRequestMiddleware.unshift(logger);
        staticRequestMiddleware.unshift(serveBundle);
    }

    return staticRequestMiddleware;
}

exports.staticRequest = staticRequest();

//UNHANDLED REQUEST
exports.unhandledRequest = [
    notFoundAsset,
    handleDifferentInitPage
];

//ON REQUEST ERROR
/**
 * Handler for errors within middleware-pipeline
 * ends the request and returns error-message depending on mode
 * @param err
 * @param req
 * @param res
 */
exports.requestError =  function(err, req, res) {

    if(err) {

        if(config.isDev) {
            console.log(err.stack);
            res.end(err.toString(), "utf-8");
            return;
        }

        res.statusCode = 500;
        res.end("(alamid) Internal Server Error.");
    }
};