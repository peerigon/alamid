"use strict";

var log = require("../../../shared/logger.js").get("server");

function getModelName(reqPath) {
    var splits = reqPath.split("/");
    return splits[splits.length-1];
}

/**
 * load Model
 * @param req
 * @param res
 * @param next
 */
function loadModel(req, res, next) {

    var modelName = getModelName(req.getPath()),
        ids = req.getIds(),
        id = null,
        method = req.getMethod();

    //assign ID for modelName
    if(ids[modelName] !== undefined) {
        id = ids[modelName];
    }

    if(method === "create") {
        if(id === null) {
            log.debug("Creating new Instance of " + modelName);
        }
        else {
            next(new Error("(alamid) Cannot load model for path '" + req.getRawPath() + "': 'create' does not accept IDs"));
            return;
        }
    }
    else if(method === "read") {
        if(id === null) {
            log.debug("Creating Instance of " + modelName + " with ID " + id);
        }
        else {
            //if we have no ID, we probably want to return a collection
            log.debug("Returning new Instance of " + modelName + " to be used for collection retrieval");
        }
    }
    else if(method === "update" || method === "delete") {
        if(id === null) {
            next(new Error("(alamid) Cannot load model for path '" + req.getRawPath() + "', '" + method + "' : Missing IDs"));
            return;
        }
        //return Model-Instance for given id
        log.debug("Creating Instance of " + modelName + " with ID " + id);
    }
    else {
        next(new Error("(alamid) Unsupported method:  " + method));
    }

    next();
}

module.exports = loadModel;