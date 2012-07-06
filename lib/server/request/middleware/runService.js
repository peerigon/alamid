"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("../../../shared/logger.js"),
    log = logger.get("server"),
    services = require("../../services.js"),
    resolveServicePath = require("../../../shared/helpers/resolvePaths.js").resolveRequestToServiceFilePath;

function runService(req, res, next) {

    function callService(path) {
        //get already loaded service from service registry
        service = services.getService(path);

        if(service[method] === undefined){
            onServiceCallFailed();
        }
        else{
            switch(req.getMethod()) {
                case 'create':
                    service.create(model, req, res, onServiceCallback);
                    break;
                case 'read':
                    service.read(model, req, res, onServiceCallback);
                    break;
                case 'readCollection' :
                    service.readCollection(model, req, res, onServiceCallback);
                    break;
                case 'update':
                    service.update(model, req, res, onServiceCallback);
                    break;
                case 'delete':
                    service.delete(model, req, res, onServiceCallback);
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

        //make next here
        next(new Error("(alamid) Service-call failed for '" + req.getMethod() + "' '" + req.getPath() + "'"));
    }

    function onServiceCallback(statusCode, result) {

        //check what object has and map it to response

        //everything else will be set automatically
        //data : model

        res.setStatusCode(statusCode);
        if (result !== undefined) {
            res.setData(result);
        }
        next(null);
    }


    var service,
    //we need to find the right path based on conventions
    //this could also be a standalone middleware
        path = resolveServicePath(req.getPath()),
        method = req.getMethod(),
    //model was attached to req by loadModel-middleware
        model = req.getModel(),
        ids = req.getIds(),
        data = req.getData();


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