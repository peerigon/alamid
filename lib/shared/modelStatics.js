"use strict";

var ModelCollection = require("./ModelCollection.class.js"),
    modelCache = require("./modelCache.js"),
    services = require("./registries/serviceRegistry.js"),
    config = require("../shared/config.js"),
    RemoteService = require("../client/remoteRequest.js").RemoteService;


function findById(id, callback) {

    var ModelClass = this;
    var instance = modelCache.get(ModelClass.url, id);

    //if we don't find an instance, we add one!
    if(instance === null) {
        instance = new ModelClass(id);
        //add instance to Cache
        modelCache.add(instance);
    }

    instance.fetch(function(err) {
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

                    delete activeModelData.id;
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

    if(config.isServer) {
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
        ids = args[0];
        params = args[1];
        callback = args[2];
        remote = true;
    }

    if(service === null) {
        throw new Error("(alamid) Can not call service: No service defined for '" + url + "'");
    }

    //we don't have remote on server-services!
    if(config.isClient && remote) {
        //load remote-service-adapter for given method
        remote = new RemoteService(url);
    }

    if (serviceFunctionLength === 4) {
        if (!config.isServer) {
            serviceFunction(remote, ids, params, onServiceResponse);
        } else {
            serviceFunction(ids, params, onServiceResponse);
        }
    }
    else if(serviceFunctionLength === 3) {
        if (!config.isServer) {
            onServiceResponse(serviceFunction.apply(remote, ids, params));
        } else {
            onServiceResponse(serviceFunction.apply(ids, params));
        }

    }
    else {
        throw new Error("(alamid) Function '" +
            String(serviceFunction).substr(0,String(serviceFunction).indexOf(")") + 1) + "' accepts unexpected number of arguments");
    }
}

exports.find = find;
exports.findById = findById;
