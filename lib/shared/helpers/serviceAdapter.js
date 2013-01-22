"use strict";

var value = require("value");

var env = require("../env.js"),
    RemoteService = require("../../client/RemoteService.class.js");

/**
 * process the response and modify the model-instance
 * @param {!Model} modelInstance
 * @param {!Object} response
 * @return {Error} err
 */
function processResponse (modelInstance, response) {

    var err = null,
        model = {};

    if (typeof response !== "object" || response === null) {
        return new Error("(alamid) Invalid Response: Object expected.");
    }

    if (response.status === "error") {
        err = new Error(response.message || "An error occurred.");
    }

    if (response.data !== undefined && response.status === "success") {
        model = response.data;
    }

    if (!err) {

        //set parent ids
        if (model.ids !== undefined) {
            modelInstance.setIds(model.ids);
        }
        //set id
        if (model.id !== undefined) {
            modelInstance.setId(model.id);
        }

        if (model && value(model).notTypeOf(modelInstance.constructor)) {
            modelInstance.set(model);    // this may throw an exception
        }
    }

    return err;
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
function callService (serviceFunction, remote, ids, data, callback) {

    var args = Array.prototype.slice.call(arguments, 0);
    //the last param is callback dude!
    callback = args[args.length-1];

    //remove the first two elements, because it's the function itself
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
        args.splice(args.length-1, 1);
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
function serviceAdapter (modelInstance, method, remote, callback) {

    var service = modelInstance.getService(),
        ids = modelInstance.getIds(),
        url = modelInstance.getUrl();

    function onServiceResponse (response) {
        var err;

        try {
            err = processResponse (modelInstance, response);

        } catch (err) {
            err.message = "(alamid) Service-Error [" + method + "] " + err.message;
        }

        if (!err) {
            modelInstance.emit(method);
        }

        callback(err, response);
    }

    //remote-services work only on the client
    if (env.isClient() && remote === true) {
        //load remote-service-adapter
        remote = new RemoteService(url);
        remote = remote[method];
    }

    //No client service defined
    //append remote-service as main service and set remote to false
    if(!service && remote === true) {
        service = remote;
        remote = false;
    }

    if (!service || !service[method]) {
        callback(new Error("(alamid) " + modelInstance.getUrl() + "[" + method + "] : There is no service available."));
        return;
    }

    //METHOD DEPENDENT CALLS
    switch (method) {

        case "create" :
            callService(service[method].bind(service), remote, ids, modelInstance, onServiceResponse);
            break;
        case "read" :
            callService(service[method].bind(service),  remote, ids, onServiceResponse);
            break;

        case "update" :
            callService(service[method].bind(service), remote, ids, modelInstance, onServiceResponse);
            break;
        case "destroy" :
            callService(service[method].bind(service), remote, ids, onServiceResponse);
            break;
        default :
            onServiceResponse(new Error("(alamid) Service-Adapter - invalid method '" + method + "'"));
    }
}

module.exports = serviceAdapter;