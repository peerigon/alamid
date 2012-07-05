"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("../../../shared/logger.js"),
    log = logger.get("server"),
    services = require("../../services.js");

/**
 * Convert a request-Path to the actual file-path of the Service
 * @param {!String} requestPath
 * @return {String}
 */
function resolveServicePath(requestPath) {

    var resPath,
        pathSplits,
        servicePath;

    pathSplits = requestPath.split("/");
    servicePath = pathSplits[pathSplits.length - 1];

    //first part
    resPath = requestPath.substr(0, requestPath.length - servicePath.length);
    resPath += servicePath + "/" + servicePath + "Service.server.class.js";

    return resPath;
}

function runService(req, res, next) {
    var service,
        path,
        model;

    function callService(path) {
        //get already loaded service from service registry
        service = services.getService(path);

        if(service[req.getMethod()] === undefined){
            onServiceCallFailed();
        }
        else{

            //model was attached to req by loadModel-middleware
            model = req.getModel();

            switch(req.getMethod()) {
                case 'create':
                    service.create(model, onServiceCallback);
                    break;
                case 'read':
                    service.read(model, onServiceCallback);
                    break;
                case 'update':
                    service.update(model, onServiceCallback);
                    break;
                case 'delete':
                    service.delete(model, onServiceCallback);
                    break;
                default:
                    onServiceCallFailed();
            }
        }
    }

    function onServiceCallFailed() {
        var allowedMethods;

        allowedMethods = service.read? 'GET, ': '';
        allowedMethods += service.create? 'POST, ': '';
        allowedMethods += service.update? 'PUT, ': '';
        allowedMethods += service.delete? 'DELETE, ': '';
        allowedMethods = allowedMethods.substr(0, allowedMethods.length - 2);  // trim off the last comma
        if (allowedMethods === '') {
            res.setStatusCode(403);
        } else {
            res.setStatusCode(405);
            res.setHeader('Allow', allowedMethods);
        }

        //make next here and mark end
        next(new Error("Service-call failed"));
    }

    function onServiceCallback(statusCode, result) {
        res.setStatusCode(statusCode);
        if (result) {
            res.setData(result);
        }
        next(null);
    }

    //we need to find the right path based on conventions
    //this could also be a standalone middleware
    path = resolveServicePath(req.getPath());

    log.debug('looking for service ' + path);

    if (services.getService(path) !== null) {
        log.debug('found... running service');
        callService(path);
        return;
    }

    log.debug("(alamid) No service found for '" + req.getMethod() + "', '" + path + "'");
    res.setStatusCode(404);
    next(new Error("(alamid) No service found for '" + req.getMethod() + "', '" + path + "'"));
}

module.exports = runService;