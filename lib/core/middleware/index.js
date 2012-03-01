var connect = require('connect'),
    paths = require('../paths.js');
    settings = require('../settings.js'),
    iterateHandlers = require('./iterateHandlers.js'),
    parseURL = require('./parseURL.js'),
    setAjaxFlag = require('./setAjaxFlag.js'),
    serveInitPageShortcut = require('./serveInitPageShortcut.js'),
    servePage = require('./pages/servePage.js'),
    serveInitJS = require('./serveInitJS.js'),
    devLogger = require('./devLogger.js'),
    handleDifferentInitPage = require('./pages/handleDifferentInitPage.js'),
    defaultHeaders = require('./defaultHeaders.js'),
    checkContentType = require('./checkContentType.js'),
    runValidator = require('./validators/runValidator.js'),
    runService = require('./services/runService.js');

var requests = [
        parseURL,
        setAjaxFlag,
        connect.bodyParser(),
        serveInitPageShortcut
    ],
    services = [
        checkContentType(['application/json']),
        defaultHeaders.setServiceHeader,
        runService
    ],
    pages = [
        defaultHeaders.setPageHeader,
        servePage
    ],
    validators = [
        checkContentType(['application/json']),
        defaultHeaders.setValidatorHeader,
        runValidator
    ],
    statics = [],
    unhandled = [
        handleDifferentInitPage
    ],
    patterns = {
        services: '/services',
        pages: '/pages',
        statics: '/statics',
        validators: '/validators',
        initJS: '/init.js'
    };

function onRequest(req, res, next) {
    iterateHandlers(requests, req, res, next);
}

function onServiceRequest(req, res, next) {
    if (req.ajax) {
        iterateHandlers(services, req, res, next);
    } else {
        next();
    }
}

function onPageRequest(req, res, next) {
    if (req.ajax) {
        iterateHandlers(pages, req, res, next);
    } else {
        next();
    }
}

function onValidatorRequest(req, res, next) {
    if (req.ajax) {
        iterateHandlers(validators, req, res, next);
    } else {
        next();
    }
}

function onStaticRequest(req, res, next) {
    iterateHandlers(statics, req, res, next);
}

function onUnhandled(req, res, next) {
    iterateHandlers(unhandled, req, res, next);
}

function init(server) {
    var staticFileServer;

    if (settings.isDev) {
        staticFileServer = connect.static(
            paths.appStatics         // maxAge defaults to 0
        );
        requests.unshift(devLogger.handler);
    } else {
        staticFileServer = connect.static(
            paths.appStatics,
            {maxAge: 2 * 60 * 60 * 1000}   // cache for 2 hours
        );
    }
    statics.push(staticFileServer);
    server.use(onRequest);
    server.use(patterns.services, onServiceRequest);
    server.use(patterns.pages, onPageRequest);
    server.use(patterns.statics, onStaticRequest);
    server.use(patterns.validators, onValidatorRequest);
    server.use(patterns.initJS, serveInitJS);
    server.use(onUnhandled);
}

exports.patterns = patterns;
exports.requests = requests;
exports.pages = pages;
exports.services = services;
exports.validators = validators;
exports.statics = statics;
exports.unhandled = unhandled;
exports.init = init;