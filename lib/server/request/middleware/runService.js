"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("../../../core/logger.js"),
    log = logger.get("server"),
    services = require("../../services.js");

function runService(req, res, next) {
    var service,
        path;

    function callService(path) {
        //load already loaded service from service registry
        service = services.getService(path);

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
    }

    function onServiceCallFailed() {
        var allowedMethods;

        allowedMethods = service.GET? 'GET, ': '';
        allowedMethods += service.POST? 'POST, ': '';
        allowedMethods += service.PUT? 'PUT, ': '';
        allowedMethods += service.DELETE? 'DELETE, ': '';
        allowedMethods = allowedMethods.substr(0, allowedMethods.length - 2);  // trim off the last comma
        if (allowedMethods === '') {
            res.setStatusCode(403);
        } else {
            res.setStatusCode(405);
            res.setHeader('Allow', allowedMethods);
        }

        //make next here and mark end
        //res.end();
        next(new Error("Service-call failed"));
    }

    function onServiceCallback(statusCode, result) {
        res.setStatusCode(statusCode);
        if (result) {
            res.setData(result);
            result = JSON.stringify(result);
        }
        next();
    }

    path = req.getPath();
    var splitPath = path.split("/");
    var serviceName = splitPath[splitPath.length-1];
    path = path+"/"+serviceName +'.server.js';

    log.debug('looking for service ' + path);

    if (services.getService(path) !== null) {
        log.debug('found... running service');
        callService(path);
        return;
    }

    log.debug('no service found');
    next();
}

module.exports = runService;