"use strict";

var config = require("../../../shared/config.js"),
    paths = config.paths,
    logger = require("../../../shared/logger.js"),
    log = logger.get("server"),
    services = require("../../../shared/registries/serviceRegistry.js"),
    Model = require("../../../shared/Model.class.js"),
    value = require("value");

/**
 * runService-Request middleware
 * @param req
 * @param res
 * @param next
 */
function runService(req, res, next) {

    var service,
        path = req.getPath(),
        method = req.getMethod(),
        model = req.model,
        ids = req.ids,
        id = req.getId(),
        data = req.data;

    /**
     * function does the actual call of the service and handles sync and async-services
     * @param serviceFunction
     * @param model
     * @param ids
     * @param data
     * @param callback
     */
    function handleServiceCall(serviceFunction, model, ids, data, callback) {

        var args = Array.prototype.slice.call(arguments, 0);
        //the last param is callback dude!
        callback = args[args.length - 1];

        //remove the first element, because it's the function itself
        args.splice(0, 1);

        if (serviceFunction.length === args.length) {
            serviceFunction.apply(null, args);
        }
        else if (serviceFunction.length === args.length - 1) {
            //remove the final callback
            args.splice(args.length - 1, 1);
            callback(serviceFunction.apply(null, args));
        }
        else {
            throw new Error("(alamid) Function '" +
                String(serviceFunction).substr(0, String(serviceFunction).indexOf(")") + 1) + "' accepts unexpected number of arguments");
        }
    }

    function callService(path) {
        //get already loaded service from service registry
        //the service registry only has server-services on the server-side!
        service = services.getService(path);

        if (service[method] === undefined) {
            log.debug("Unsupported Method:  " + method);
            onServiceCallFailed();
        }
        else {
            switch (method) {
                case 'create':
                    //model = ModelClass , data = pure request data
                    if (value(model).instanceOf(Model)) {

                        model.save(false, function (err, response) {

                            if (err) {
                                onServiceCallback({ status : "error", message : err.message });
                                return;
                            }

                            onServiceCallback(response);
                        });
                    }
                    else {
                        handleServiceCall(service.create, ids, data, onServiceCallback);
                    }
                    break;
                case 'read':
                    //if no id is set, we have a collection request
                    //READ COLLECTION
                    if (id === undefined || id === null) {
                        //data = pure request data
                        handleServiceCall(service.readCollection.bind(service), ids, data, onServiceCallback);
                        break;
                    }
                    handleServiceCall(service.read.bind(service), ids, onServiceCallback);
                    break;
                case 'update':
                    if (value(model).instanceOf(Model)) {
                        model.save(function (err, response) {
                            if (err) {
                                onServiceCallback({ status : "error", message : err.message });
                            }
                            else {
                                onServiceCallback(response);
                            }
                        });
                    }
                    else {
                        handleServiceCall(service.update.bind(service), ids, data, onServiceCallback);
                    }
                    break;
                case 'destroy':
                    handleServiceCall(service.destroy.bind(service), ids, onServiceCallback);
                    break;
                default:
                    onServiceCallFailed();
            }
        }
    }

    function onServiceCallFailed() {
        var allowedMethods;

        allowedMethods = service.read ? 'GET, ' : '';
        allowedMethods += service.create ? 'POST, ' : '';
        allowedMethods += service.update ? 'PUT, ' : '';
        allowedMethods += service.destroy ? 'DELETE, ' : '';
        allowedMethods = allowedMethods.substr(0, allowedMethods.length - 2);  // trim off the last comma
        if (allowedMethods === '') {
            res.setStatusCode(403);
        } else {
            res.setStatusCode(405);
            res.setHeader('Allow', allowedMethods);
        }

        next(new Error("Unsupported Method."));
    }

    function onServiceCallback(resObj) {

        //pass error thru
        if (resObj instanceof Error) {
            next(resObj);
            return;
        }
        //if callback() was called without params
        if (resObj === undefined || resObj === null) {
            next(new Error("Service did not return anything."));
            return;
        }

        //set jSend attributes
        if (resObj.status !== undefined) {
            res.setStatus(resObj.status);
        }

        if (resObj.data !== undefined) {
            res.setData(resObj.data);
        }
        if (resObj.message !== undefined) {
            res.setErrorMessage(resObj.message);
        }

        next(null);
    }

    //attach the data to the model if model = modelInstance
    if (value(model).instanceOf(Model)) {
        model.setIds(ids);
        //accept to determine change data
        model.accept();
        model.set(data);
    }

    if (services.getService(path) !== null) {
        callService(path);
        return;
    }

    res.setStatusCode(404);
    next(new Error("No service found."));
}

module.exports = runService;