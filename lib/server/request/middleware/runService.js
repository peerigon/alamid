"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("../../../shared/logger.js"),
    log = logger.get("server"),
    services = require("../../../shared/services.js");

function runService(req, res, next) {

    function callService(path) {
        //get already loaded service from service registry
        //the service registry only has server-services on the server-side!
        service = services.getService(path);

        if(service[method] === undefined){
            log.debug("Unsupported Method:  " + method);
            onServiceCallFailed();
        }
        else{
            switch(req.getMethod()) {
                case 'create':
                    service.create(model, onServiceCallback);
                    break;
                case 'read':
                    //if no id is set, we have a collection request
                    if(req.getId() === undefined) {
                        //model = data in case of collection
                        service.readCollection(model, onServiceCallback);
                        break;
                    }
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

        //make next here
        next(new Error("Service-call failed for '" + req.getMethod() + "' '" + req.getPath() + "'. Unsupported Method."));
    }

    function onServiceCallback(resObj) {
        //pass error thru
        if(resObj instanceof Error) {
            next(resObj);
        }
        //if callback() was called without params
        if(resObj === undefined) {
            next(new Error("Service did not return anything."));
            return;
        }

        //set jSend attributes
        if(resObj.status !== undefined) {
            res.setStatus(resObj.status);
        }
        if(resObj.data !== undefined) {
            res.setData(resObj.data);
        }
        if(resObj.errorMessage !== undefined) {
            res.setErrorMessage(resObj.errorMessage);
        }
        next(null);
    }

    var service,
        path = req.getPath(),
        method = req.getMethod(),
        model = req.getModel(),
        ids = req.getIds(),
        data = req.getData();

    //attach the IDs of the request if model = MODEL-Instance
    if(model !== null && model.setParentIds !== undefined) {
        model.setParentIds(ids);
    }

    log.debug('looking for service ' + path);
    if (services.getService(path) !== null) {
        log.debug('found... running service');
        callService(path);
        return;
    }

    res.setStatusCode(404);
    log.debug("No service found for '" + req.getMethod() + "', '" + path + "'");
    next(new Error("No service found for '" + req.getMethod() + "', '" + path + "'"));
}

module.exports = runService;