"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("../../../shared/logger.js"),
    log = logger.get("server"),
    services = require("../../../shared/services.js");

function runService(req, res, next) {

    function callService(path) {
        //get already loaded service from service registry
        //the service registry only has server-services on the server!
        service = services.getService(path);

        if(service[method] === undefined){
            log.debug("Unsupported Method:  " + method);
            onServiceCallFailed();
        }
        else{
            switch(req.getMethod()) {
                case 'create':
                    service.create(model, req, res, onServiceCallback);
                    break;
                case 'read':
                    //if no id is set, we have a collection request
                    if(req.getId() === undefined) {
                        service.readCollection(model, req, res, onServiceCallback);
                        break;
                    }

                    service.read(model, req, res, onServiceCallback);
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
        next(new Error("(alamid) Service-call failed for '" + req.getMethod() + "' '" + req.getPath() + "'. Unsupported Method!"));
    }

    function onServiceCallback(resObj) {

        //TODO what happens if resObj === Error?
        //should we handle this case as kind of special error?

        //if callback() was called without params
        if(resObj === undefined) {
            //if nothing was set, we assume the model has been filled
            if(typeof(model) === "function") {
                res.setData(model.get());
            }
            else {
                res.setData(model);
            }
            next(null);
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
    //we need to find the right path based on conventions
    //this could also be a standalone middleware
        path = req.getPath(),
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

    log.debug("No service found for '" + req.getMethod() + "', '" + path + "'");
    res.setStatusCode(404);
    next(new Error("No service found for '" + req.getMethod() + "', '" + path + "'"));
}

module.exports = runService;