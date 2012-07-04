"use strict";

var log = require("../../../shared/logger.js").get("server"),
    models = require("../../models.js"),
    config = require("../../../shared/config");

/**
 * derive the modelPath from given requestPath
 * @param {!String} reqPath
 * @return {String}
 */
function getModelPath(reqPath) {

    //if we want to use a path
    //var modelPath = reqPath.substr(config.paths.services);
    //return modelPath;
    var splits = reqPath.split("/");
    return splits[splits.length-1];
}

/**
 * returns a model-class or modelInstance if ID was set
 * returns req.getData() if not model was found
 * use forceInstance to get an instance even when ID is not set (null)
 * @param {!Object} req
 * @param {!String} modelPath
 * @param {String} id
 * @param {Boolean} forceInstance
 * @return {Object}
 */
function getModel(req, modelPath, id, forceInstance) {

    //loadModel
    var ModelClass = models.loadModel(modelPath);

    //if we can not find a model, we attach the object
    if(ModelClass === null) {
        return req.getData();
    }

    //attach the instance
    if(id === undefined) {
        if(forceInstance !== undefined && forceInstance === true) {
            return new ModelClass();
        }
        return ModelClass;
    }

    return new ModelClass(id);
}

/**
 * load Model-middleware
 * append the model to the request-object
 * @param {!Object} req
 * @param {!Object} res
 * @param {!Function} next
 */
function loadModel(req, res, next) {

    var modelPath = getModelPath(req.getPath()),
        ids = req.getIds(),
        id = null,
        method = req.getMethod();

    //assign ID for modelName
    if(ids[modelPath] !== undefined) {
        id = ids[modelPath];
    }

    if(method === "create") {
        if(id === null) {
            log.debug("Creating new Instance of " + modelPath);
            //force new instance
            req.setModel(getModel(req, modelPath, null, true));
        }
        else {
            next(new Error("(alamid) Cannot load model for path '" + req.getRawPath() + "': 'create' does not accept IDs"));
            return;
        }
    }
    else if(method === "read") {
        if(id === null) {
            //if we have no ID, we probably want to return a collection
            log.debug("Returning the class of " + modelPath + " to be used for collection retrieval");
            req.setModel(getModel(req, modelPath));
        }
        else {
            log.debug("Creating Instance of " + modelPath + " with ID " + id);
            req.setModel(getModel(req, modelPath, id));
        }
    }
    else if(method === "update" || method === "delete") {
        if(id === null) {
            next(new Error("(alamid) Cannot load model for path '" + req.getRawPath() + "', '" + method + "' : Missing IDs"));
            return;
        }
        //return Model-Instance for given id
        log.debug("Creating Instance of " + modelPath + " with ID " + id);
        req.setModel(getModel(req, modelPath, id));
    }
    else {
        next(new Error("(alamid) Unsupported method:  " + method));
    }

    next();
}

module.exports = loadModel;