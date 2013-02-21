"use strict";

var value = require("value");

var env = require("../env.js"),
    RemoteService;

if (env.isClient()) {
    RemoteService = require("../../client/RemoteService.class.js");
}

/**
 * process the response and modify the model-instance
 * @param {!Model} modelInstance
 * @param {!Object} response
 * @return {Error} err
 */
function processResponse(modelInstance, response) {

    var modelData = {};

    if (typeof response !== "object" || response === null) {
        throw new Error("(alamid) Invalid Response: Object expected.");
    }

    if (response.status === "error") {
        throw new Error(response.message || "An error occurred.");
    }

    if (response.data !== undefined && response.status === "success") {
        modelData = response.data;
    }

    //set parent ids
    if (modelData.ids !== undefined) {
        modelInstance.setIds(modelData.ids);
    }
    //set id
    if (modelData.id !== undefined) {
        modelInstance.setId(modelData.id);
    }

    if (modelData && value(modelData).notTypeOf(modelInstance.constructor)) {
        modelInstance.set(modelData);    // this may throw an exception
    }
}

/**
 * call the actual service
 * function acts like a proxy and strips unneeded params
 * it also handles sync / async service-responses
 *
 * @param {!Function} serviceFunction
 * @param {Boolean} remote
 * @param {Object} ids
 * @param {Object} data
 * @param {Function} callback
 */
function callService(serviceFunction, remote, ids, data, callback) {

    var args = Array.prototype.slice.call(arguments, 0);
    //the last param is callback dude!
    callback = args[args.length - 1];

    //remove the first element, because it's the function itself
    args.splice(0, 1);

    //remove "remote" attribute on the server
    if (env.isServer()) {
        args.splice(0, 1);
    }

    //async
    if (serviceFunction.length === args.length) {
        serviceFunction.apply(this, args);
    }
    //sync
    else if (serviceFunction.length === args.length - 1) {
        //remove the final callback
        args.splice(args.length - 1, 1);
        callback(serviceFunction.apply(this, args));
    }
    //invalid function passed
    else {
        throw new Error("(alamid) Function '" +
            serviceFunction.toString().replace(/\s\{.*/, "") + "' accepts unexpected number of arguments");
    }
}

/**
 * handle the service call and model-modification
 * returns an error and the service-call response
 *
 * @param {!Model} modelInstance
 * @param {!String} method
 * @param {!Boolean} remote
 * @param {!Function} callback
 */
function serviceAdapter(modelInstance, method, remote, callback) {

    var remoteService,
        serviceFunction,
        remoteServiceFunction,
        service = modelInstance.getService(),
        ids = modelInstance.getIds(),
        url = modelInstance.getUrl(),
        params;

    //only for readCollection
    if (typeof modelInstance.getParams === "function") {
        params = modelInstance.getParams();
    }

    function onServiceResponse(response) {

        var err = null;

        try {
            processResponse(modelInstance, response);
        } catch (e) {
            e.message = "(alamid) Service-Error [" + method + "] " + e.message;
            err = e;
        }

        if (!err) {
            modelInstance.emit(method);
        }

        callback(err, response);
    }

    if (service && service[method] !== undefined) {
        serviceFunction = service[method].bind(service);
    }

    //remote-services work only on the client
    if (env.isClient() && remote === true) {
        //load remote-service-adapter
        remoteService = new RemoteService(url);
        remoteServiceFunction = remoteService[method].bind(remoteService);
        //append to be used in service
        remote = remoteServiceFunction;
    }

    //No client service defined
    //append remote-service as main service and set remote to false
    if (!serviceFunction && remote !== false && env.isClient()) {
        serviceFunction = remoteServiceFunction;
        remote = true; // will be recycled by remoteService
    }

    if (!serviceFunction) {
        callback(new Error("(alamid) " + modelInstance.getUrl() + "[" + method + "] : There is no service available."));
        return;
    }

    //METHOD DEPENDENT CALLS
    switch (method) {

        case "create" :
            callService(serviceFunction, remote, ids, modelInstance, onServiceResponse);
            break;
        case "read" :
            callService(serviceFunction, remote, ids, onServiceResponse);
            break;
        case "readCollection" :
            //direct callback here, no processing, because there is no instance
            callService(serviceFunction, remote, ids, params, function (response) {
                //the callback-signature has to be the same as onServiceResponse
                //err, response
                callback(null, response);
            });
            break;
        case "update" :
            callService(serviceFunction, remote, ids, modelInstance, onServiceResponse);
            break;
        case "destroy" :
            callService(serviceFunction, remote, ids, onServiceResponse);
            break;
        default :
            onServiceResponse(new Error("(alamid) Service-Adapter - Invalid method '" + method + "'"));
    }
}

module.exports = serviceAdapter;