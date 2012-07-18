"use strict";

var models = {};

function setModels(modelsObject) {
    if(modelsObject !== undefined && modelsObject !== null) {
        models = modelsObject;
    }
}

function setModel(modelName, model) {
    if(modelName !== undefined && model !== undefined) {
        models[modelName] = model;
    }
}

/**
 * get the model for the given path
 * @param {String} modelName
 * @return {Function}
 */
function getModel(modelName) {

    //only expose server files and existing paths
    if(models[modelName] !== undefined) {
        return models[modelName];
    }
    return null;
}

exports.models = models;
exports.getModel = getModel;
exports.setModel = setModel;
exports.setModels = setModels;