"use strict";

var config = require("./../config.js");

var services = {};

function setServices(servicesObject) {
    if(servicesObject !== undefined && servicesObject !== null) {
        services = servicesObject;
    }
}

function setService(path, service) {
    if(service !== undefined && path !== undefined) {
        services[path] = service;
    }
}

/**
 * get the service for the given path
 * @param {String} path
 * @return {Function}
 */
function getService(path) {

    //expose file if it exists
    if(services[path] !== undefined) {
        return services[path];
    }

    //we return wrappers on the client
    //if no other service was found
    //might clash if we call remote-service automatically
    if(config.isClient) {
        return getRemoteService(path);
    }

    return null;
}

function getRemoteService(path) {
    //we return wrappers on the client
    if(config.isClient) {
        var RemoteService = require("../../client/RemoteService.js");
        return new RemoteService(path);
    }
    //no remote-service on server
    return null;
}

exports.services = services;
exports.getService = getService;
exports.getRemoteService = getRemoteService;
exports.setService = setService;
exports.setServices = setServices;