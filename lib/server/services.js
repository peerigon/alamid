"use strict";

var filters = require("../shared/helpers/paths.js").filters;

var services = {};

function getService(path) {

    //only expose server files and existing paths
    if(services[path] !== undefined && filters.onlyServerFiles(path)) {
        return services[path];
    }

    return null;
}

exports.services = services;
exports.getService = getService;