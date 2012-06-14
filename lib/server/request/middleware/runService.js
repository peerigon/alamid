"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("../../../core/logger.js"),
    log = logger.get("server"),
    services = require("../../services.js");


function runService(req, res, next) {
    var service,
        path,
        param;

    function callService(path) {

        //service = require(path);
        //the new and way better way!
        //>> no more require with user string
        service = services.getService(path);

        if (service[req.getMethod()]) {
            switch(req.getMethod()) {
            case 'GET':
                service.GET(req.getData(), onServiceCallback);
                break;
            case 'POST':
                service.POST(req.getData(), onServiceCallback);
                break;
            case 'PUT':
                service.PUT(req.getData(), onServiceCallback);
                break;
            case 'DELETE':
                service.DELETE(req.getData(), onServiceCallback);
                break;
            default:
                onServiceCallFailed();
            }
        } else {
            onServiceCallFailed();
        }
    }

    function onServiceCallFailed() {
        var allowedMethods;

        allowedMethods = service.GET? 'GET, ': '';
        allowedMethods += service.POST? 'POST, ': '';
        allowedMethods += service.PUT? 'PUT, ': '';
        allowedMethods += service.DELETE? 'DELETE, ': '';
        allowedMethods = allowedMethods.substr(0, allowedMethods.length - 2);  // trim off the last comma
        if (allowedMethods === '') {
            res.statusCode = 403;
        } else {
            res.statusCode = 405;
            res.setHeader('Allow', allowedMethods);
        }

        //make next here and mark end
        //res.end();
        next(new Error("Service-call failed"));
    }

    function onServiceCallback(statusCode, result) {
        res.statusCode = statusCode;
        if (result) {
            result = JSON.stringify(result);
        }
        //don't end it here!
        //res.end(result);
        //res.setResult(result);
        next();
    }

    if ((/\?.*/i.test(req.url) && req.getMethod() === 'GET') ||
            req.getMethod() === 'POST') {
        path = paths.compiledPath + req.getPath();
    }
    else {
        path = req.getPath().split('/');
        //param = path.pop();
        path = paths.compiledPath + path.join('/');
    }
    path = path + '.server.js';
    if (config.isDev) {
        console.log('looking for service ' + path);
    }
    if (services.getService(path) !== null) {
        if (config.isDev) {
            console.log('found... running service');
        }

        callService(path);

        return;
    }
    if (config.isDev) {
        console.log('no service found');
    }
    next();
}

module.exports = runService;