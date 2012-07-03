"use strict";

var log = require("../../../shared/logger.js").get("server");

function getModelName(reqPath) {

    var splits = reqPath.split("/");
    return splits[splits.length-1];
}

function loadModel(req, res, next) {

    var modelName = getModelName(req.getPath()),
        ids = req.getIds(),
        id = null;

    //assign ID for modelName
    if(ids[modelName]) {
        id = ids[modelName];
    }

    if(req.getMethod() === "create") {
        if(id === null) {
            log.debug("Creating new Instance of " + modelName);
        }
        else {
            next(new Error("(alamid) Load-Model-Middleware - CREATE does not accept IDs passed via URL"));
            return;
        }
    }
    else if(req.getMethod() === "read") {
        if(id === null) {
            log.debug("Creating Instance of " + modelName + " with ID " + id);
        }
        else {
            //if we have no ID, we probably want to return a collection
            log.debug("Returning new Instance of " + modelName + " to be used for collection retrieval");
        }
    }
    else if(req.getMethod() === "update" || req.getMethod() === "delete") {
        if(id === null) {
            next(new Error("(alamid) Could not load Model " + modelName + " - not ID passed"));
            return;
        }
        //return Model-Instance for given id
        log.debug("Creating Instance of " + modelName + " with ID " + id);
    }
    else {
        next(new Error("(alamid) Load-Model-Middleware - Unsupported method:  " + req.getMethod()));
    }

    next();
}

    /*

     var DummyModel = function(ids, data) {

     this.data = {};
     this.ids = {};

     this.init = function(ids, data) {
     this.data = data;
     this.ids = ids;
     };

     this.getIds = function() {
     return this.ids;
     };

     this.getData = function() {
     return this.data;
     };

     this.init(ids, data);
     };

     return new DummyModel(ids, data);
     */

module.exports = loadModel;