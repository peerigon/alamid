"use strict";

var ModelCollection = require("./ModelCollection.class.js"),
    modelCache = require("./modelCache.js"),
    services = require("./registries/serviceRegistry.js"),
    environment = require("./environment.js"),
    RemoteService = require("../client/RemoteService.js");

/**
 * Find a fully populated model-Instance by given ID
 *
 * Returns a cached instance if already in cache
 * Creates a new instance if nothing was found in cache an populates it with data (fetch)
 *
 * User.findById(12, function(err, user12){});
 *
 * User.findById(false, 12, function(err, user12){});
 *
 * User.findById({ Group : 2 }, 12, function(err, user12){});
 *
 * @params {Boolean} remote should the remote-service be contacted (default : true)
 * @params {Object} ids the parent IDs
 * @param {String|Number} id the ID of the model you want to load
 * @param {Function} callback
 */
function findById(remote, ids, id, callback) {

    var args = Array.prototype.slice.call(arguments, 0);

    //Called with three params
    if(typeof(id) === "function") {
        callback = args[2];

        //User.findById({ Group : 2 }, 12, function(err, user12){});
        if(typeof(args[0]) === "object") {
            ids = args[0];
            remote = true;
        }
        //User.findById(false, 12, function(err, user12){});
        else{
            ids = {};
        }

        id = args[1];
    }

    //called with two params
    //User.findById(12, function(err, user12){});
    if(typeof(ids) === "function") {
        callback = args[1];
        remote = true;
        id = args[0];
        ids = {};
    }

    var ModelClass = this;
    var instance = modelCache.get(ModelClass.url, id);

    //if we don't find an instance, we add one!
    if(instance === null) {
        instance = new ModelClass(id);
        //add instance to Cache
        modelCache.add(instance);
    }

    instance.setParentIds(ids);

    instance.fetch(remote, function(err) {
        if(err) {
            callback(err);
            return;
        }
        callback(null, instance);
    });
}

/**
 * Find a collection of models that match params and ids
 *
 * @param {Boolean} remote should the remoteService be contacted (default:true)
 * @param {Object} ids the parent ids for embedded-document finds
 * @param {!Object} params the params you want to select your models by
 * @param {Function} callback
 *
 *
 * User.find({ age : ">10"}, onFind);
 *
 * Comment.find({ blogPost : 1 }, { authorId : 3 }, onFind);
 *
 * //don't contact remoteServices
 * Comment.find(false, { blogPost : 1 }, { authorId : 3 }, onFind);
 *
 */
function find(remote, ids, params, callback) {

    function createInstances(modelDataArray) {
        var arrayElem,
            activeModelData,
            models = [],
            modelInstance;

        for(arrayElem in modelDataArray) {
            if(modelDataArray.hasOwnProperty(arrayElem)){
                activeModelData = modelDataArray[arrayElem];
                if(activeModelData.id !== undefined) {

                    //check for cached instances
                    modelInstance = modelCache.get(ModelClass.url, activeModelData.id);

                    if(modelInstance === null) {
                        modelInstance = new ModelClass(activeModelData.id);
                        modelCache.add(modelInstance);
                    }

                    //we can't set id via "set"
                    delete activeModelData.id;

                    //set parent IDs
                    if(activeModelData.ids !== undefined) {
                        modelInstance.setParentIds(activeModelData.ids);
                        //can't be used via SET
                        delete activeModelData.ids;
                    }

                    modelInstance.set(activeModelData);

                    models.push(modelInstance);
                }
            }
        }
        return models;
    }

    function onServiceResponse(response) {
        if(response.status === "success" && response.data !== undefined) {
            var modelsArray = createInstances(response.data);
            callback(null, new ModelCollection(ModelClass, modelsArray));
        }
        else {
            callback(new Error(response.message));
        }
    }

    var ModelClass = this,
        url = ModelClass.url,
        service = services.getService(url),
        serviceFunction = service.readCollection,
        args = Array.prototype.slice.call(arguments, 0),
        serviceFunctionLength = serviceFunction.length;

    if(environment.isServer()) {
        serviceFunctionLength--;
    }

    //check optional args
    if(args.length === 2) {
        params = args[0];
        callback = args[1];
        remote = true;
        ids = {};
    }
    else if(args.length === 3) {
        if(typeof(args[0]) === "object") {
            ids = args[0];
            remote = true;
        }
        else{
            ids = {};
            remote = args[0];
        }

        params = args[1];
        callback = args[2];
    }

    if(service === null) {
        throw new Error("(alamid) Can not call service: No service defined for '" + url + "'");
    }

    //we don't have remote on server-services!
    if(environment.isClient() && remote) {
        //load remote-service-adapter for given method
        remote = new RemoteService(url);
    }

    if (serviceFunctionLength === 4) {
        if (!environment.isServer()) {
            serviceFunction(remote, ids, params, onServiceResponse);
        } else {
            serviceFunction(ids, params, onServiceResponse);
        }
    }
    else if(serviceFunctionLength === 3) {
        if (!environment.isServer()) {
            onServiceResponse(serviceFunction.apply(remote, ids, params));
        } else {
            onServiceResponse(serviceFunction.apply(ids, params));
        }

    }
    else {
        throw new Error("(alamid) Function '" +
            serviceFunction.toString().replace(/\s\{.*/, "") + "' accepts unexpected number of arguments");
    }
}

exports.find = find;
exports.findById = findById;
