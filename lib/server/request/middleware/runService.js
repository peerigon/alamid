"use strict";

var config = require("../../../core/config"),
    paths = config.paths,
    logger = require("../../../shared/logger.js"),
    log = logger.get("server"),
    services = require("../../../shared/registries/serviceRegistry.js");

function runService(req, res, next) {

    /**
     * function does the actual call of the service and handles sync and async-services
     * @param serviceFunction
     * @param model
     * @param callback
     */
    function handleServiceCall(serviceFunction, model, callback) {
        if (serviceFunction.length === 2) {
            serviceFunction(model, callback);
        }
        else if(serviceFunction.length === 1) {
            callback(serviceFunction(model));
        }
        else {
            throw new Error("(alamid) Function '" +
                String(serviceFunction).substr(0,String(serviceFunction).indexOf(")") + 1) + "' accepts unexpected number of arguments");
        }
    }

    function callService(path) {
        //get already loaded service from service registry
        //the service registry only has server-services on the server-side!
        service = services.getService(path);

        if(service[method] === undefined){
            log.debug("Unsupported Method:  " + method);
            onServiceCallFailed();
        }
        else{
            switch(method) {
                case 'create':
                    handleServiceCall(service.create, model, onServiceCallback);
                    break;
                case 'read':
                    //if no id is set, we have a collection request
                    if(req.getId() === undefined) {
                        //model = data in case of collection
                        handleServiceCall(service.readCollection, model, onServiceCallback);
                        break;
                    }
                    handleServiceCall(service.read, model, onServiceCallback);
                    break;
                case 'update':
                    handleServiceCall(service.update, model, onServiceCallback);
                    break;
                case 'delete':
                    handleServiceCall(service.delete, model, onServiceCallback);
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