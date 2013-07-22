"use strict";

var connect = require("connect"),
    logger = connect.logger(":method :url :status - :response-time ms");

var config = require("../../../shared/config"),
    paths = config.paths,
    env = require("../../../shared/env.js");

var Bundler = require("../../../core/bundle/Bundler.class.js"),
    parseURL = require("./middleware/parseURL.js"),
    serveInitPageShortcut = require("./middleware/serveInitPageShortcut.js"),
    serveInitPage = require("./middleware/serveInitPage.js"),
    notFoundAsset = require("./middleware/notFoundAsset.js"),
    staticFileHandler = require("./middleware/staticFileHandler.js"),
    defaultHeaders = require("./middleware/defaultHeaders.js"),
    checkContentType = require("./middleware/checkContentType.js"),
    httpAdapter = require("./middleware/httpAdapter.js");

function staticRequest() {
    var bundler;

    if (env.isDevelopment()) {

        staticRequestStack.unshift(logger);

        if (config.use.bundle) {
            bundler = Bundler.getInstance();
            staticRequestStack.unshift(bundler.getDevMiddleware());
        }
    }

    return staticRequestStack;
}

//ON REQUEST
exports.request = [
    parseURL,
    connect.json(),
    connect.urlencoded(),
    serveInitPageShortcut
];

//SERVICE REQUEST
exports.serviceRequest = [
    checkContentType(["application/json"]),
    defaultHeaders.setServiceHeader,
    httpAdapter
];

//VALIDATOR REQUEST
exports.validatorRequest = [
    checkContentType(["application/json"]),
    defaultHeaders.setValidatorHeader,
    httpAdapter
];

//STATIC REQUEST
var staticRequestStack = [
    staticFileHandler
];

//will be set on init
//so you have to call init
exports.staticRequest = null;

//UNHANDLED REQUEST
exports.unhandledRequest = [
    notFoundAsset,
    serveInitPage
];

//ON REQUEST ERROR
/**
 * Handler for errors within middleware-pipeline
 * ends the request and returns error-message depending on mode
 * @param err
 * @param req
 * @param res
 */
exports.requestError = function (err, req, res) {

    if (err) {

        if (env.isDevelopment()) {
            console.log(err.stack);
            res.end(err.toString(), "utf-8");
            return;
        }

        res.statusCode = 500;
        res.end("(alamid) Internal Server Error.");
    }
};

/**
 * helpers function to defined static file-server
 * @param staticFileHandler
 */
exports.setStaticFileHandler = function (staticFileHandler) {

    staticRequestStack = [
        staticFileHandler
    ];
};

/**
 * don't forget to call init
 * before on server start
 */
exports.init = function () {
    //TODO find a better way to solve this problem
    //routes should not be initialized on require
    exports.staticRequest = staticRequest();
};