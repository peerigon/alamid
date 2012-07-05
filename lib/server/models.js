"use strict";

var filters = require("../shared/helpers/pathHelpers.js").filters;

var models = {};

function setModels(modelsObject) {
    models = modelsObject;
}

/**
 * get the modle for the given path
 * @param {String} modelName
 * @return {Function}
 */
function getModel(modelName) {

    //only expose server files and existing paths
    if(models[modelName] !== undefined && filters.onlyServerFiles(modelName)) {
        return models[modelName];
    }
    return null;
}

exports.models = models;
exports.getModel = getModel;
exports.setModels = setModels;