"use strict";

var ModelCollection = require("./ModelCollection.class.js"),
    modelCache = require("./modelCache.js"),
    services = require("./registries/serviceRegistry.js");


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


function find(params, callback) {

    var ModelClass = this,
        url = ModelClass.url,
        service = services.getService(url);

    if(service === null) {
        throw new Error("(alamid) Can not call service: No service defined for '" + url + "'");
    }

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

    //async
    if(service.readCollection.length === 2) {
        service.readCollection(params, onServiceResponse);
    }
    //sync
    else if(service.readCollection.length === 1 ){
        onServiceResponse(service.readCollection(params));
    }
    else{
        throw new Error("(alamid) Function '" +
            String(service.readCollection).substr(0,String(service.readCollection).indexOf(")") + 1) + "' accepts unexpected number of arguments");
    }

}

exports.find = find;
exports.findById = findById;