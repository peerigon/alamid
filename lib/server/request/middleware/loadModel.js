"use strict";

var log = require("../../../shared/logger.js").get("server"),
    models = require("../../../shared/registries/modelRegistry.js"),
    config = require("../../../shared/config");

/**
 * returns a model-class or modelInstance if ID was set
 * @param {!String} modelPath
 * @param {String} id
 * @return {Object}
 */
function getModel(modelPath, id) {

    //loadModel
    var ModelClass = models.getModel(modelPath);

    if(ModelClass !== null) {
        //attach the instance
        if(id === undefined) {
            return new ModelClass();
        }
        return new ModelClass(id);
    }
    return null;
}

/**
 * load Model-middleware
 * append the model to the request-object
 * @param {!Object} req
 * @param {!Object} res
 * @param {!Function} next
 */
function loadModel(req, res, next) {

    //check if model has already been set by middleware
    if(req.getModel() !== null) {
        log.debug("Model already defined by middleware. Skipping autoload for '" + req.getPath() + "'");
        next();
        return;
    }

    log.debug("Model autoloading for '" + req.getPath()+"'");

    //autoLoad!
    var modelPath = req.getPath(),
        ids = req.getIds(),
        id = null,
        method = req.getMethod();

    //assign ID for modelName
    if(ids[modelPath] !== undefined) {
        id = ids[modelPath];
    }

    //load class for create
    if(method === "create") {
        var createModel;

        if(id === null) {
            log.debug("Adding Model-Instance without ID for '" + modelPath + " (CREATE)");
        }
        else {
            next(new Error("(alamid) Cannot load model for path '" + req.getRawPath() + "': 'create' does not accept IDs"));
            return;
        }

        createModel = getModel(modelPath, null);

        if(createModel !== null) {
            req.setModel(createModel);
        }
    }
    //create instance for update
    else if(method === "update") {

        var updateModel;

        if(id === null) {
            next(new Error("(alamid) Cannot load model for path '" + req.getRawPath() + "', '" + method + "' : Missing IDs"));
            return;
        }

        updateModel = getModel(modelPath, id);

        if(updateModel !== null) {
            //return Model-Instance for given id
            log.debug("Adding Model-Instance for  '" + modelPath + "' with ID '" + id + "' (" + method + ")");
            req.setModel(updateModel);
        }
    }
    else {
        log.debug("No model-autoloading for: " + method);
    }
   next();
}

module.exports = loadModel;