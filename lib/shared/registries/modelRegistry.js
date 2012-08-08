"use strict";

var models = {};

/**
 * set many models at once
 * @param modelsObject {Object}
 */
function setModels(modelsObject) {
    if(modelsObject !== undefined && modelsObject !== null) {
        models = modelsObject;
    }
}

/**
 * set a single model
 * @param modelUrl {String} the url of a model i.e. "blogpost/comment"
 * @param model {Object}
 */
function setModel(modelUrl, model) {
    if(modelUrl !== undefined && model !== undefined) {
        models[modelUrl] = model;
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