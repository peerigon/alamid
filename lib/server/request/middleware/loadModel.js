"use strict";

var log = require("../../../shared/logger.js").get("server"),
    models = require("../../../shared/registries/modelRegistry.js"),
    config = require("../../../shared/config.js");

/**
 * returns a model-class or modelInstance if ID was set
 * @param {!String} modelPath
 * @param {String} id
 * @return {Object}
 */
function getModel(modelPath, id) {

    //loadModel
    var ModelClass = models.getModel(modelPath);

    if (ModelClass !== null) {
        //attach the instance
        if (id === undefined) {
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
    if (req.model !== null) {
        next();
        return;
    }

    //autoLoad!
    var modelPath = req.getPath(),
        ids = req.ids,
        id = null,
        method = req.getMethod();

    //assign ID for modelName
    if (ids[modelPath] !== undefined) {
        id = ids[modelPath];
    }

    //load class for create
    if (method === "create") {
        var createModel;

        if (id !== null) {
            next(new Error("Cannot load model - 'create' does not accept IDs"));
            return;
        }

        createModel = getModel(modelPath, null);

        if (createModel !== null) {
            req.model = createModel;
        }
    }
    //create instance for update
    else if (method === "update") {

        var updateModel;

        if (id === null) {
            next(new Error("Cannot load model - '" + method + "' needs IDs"));
            return;
        }

        updateModel = getModel(modelPath, id);

        if (updateModel !== null) {
            //return Model-Instance for given id
            req.model = updateModel;
        }
    }
    next();
}

module.exports = loadModel;