"use strict";

var filters = require("../shared/helpers/pathHelpers.js").filters;

var services = {};

function setServices(servicesObject) {
    if(servicesObject !== undefined && servicesObject !== null) {
        services = servicesObject;
    }
}

/**
 * get the service for the given path
 * @param {String} path
 * @return {Function}
 */
function getService(path) {

    //only expose server files and existing paths
    if(services[path] !== undefined && filters.onlyServerFiles(path)) {
        return services[path];
    }
    return null;
}

exports.services = services;
exports.getService = getService;
exports.setServices = setServices;