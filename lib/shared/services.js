"use strict";

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

    //only expose server files and existing paths
    if(services[path] !== undefined) {
        return services[path];
    }
    return null;
}

exports.services = services;
exports.getService = getService;
exports.setService = setService;
exports.setServices = setServices;