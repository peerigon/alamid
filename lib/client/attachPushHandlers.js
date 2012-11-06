"use strict";

var log = require("../shared/logger").get("client"),
    modelCache = require("../shared/modelCache.js"),
    modelRegistry = require("../shared/registries/modelRegistry.js");

/**
 * attach push handlers for the connected socket.io client
 * only call this function once.
 * @param {Object} socket
 */
function attachPushHandlers(socket) {

    //REMOTE UPDATE
    socket.on('remoteUpdate', function (modelUrl, modelIds, modelData) {
        log.debug("push-update for: " + modelUrl + " with IDs '"+ modelIds + "' - passed Data" + modelData);

        var ModelClass = modelRegistry.getModel(modelUrl),
            modelToNotify = modelCache.get(modelUrl, modelIds[modelUrl]);

        if(modelToNotify === null) {
            modelToNotify = new ModelClass(modelIds[modelUrl]);
            modelToNotify.setParentIds(modelIds);
            modelCache.add(modelToNotify);
        }

        var event = {
            model : modelToNotify,
            parentIds : modelIds,
            data : modelData
        };

        ModelClass.emit("remoteUpdate", event);
    });

    //REMOTE DELETE
    socket.on('remoteDestroy', function (modelUrl, modelIds) {
        log.debug("push-destroy for: " + modelUrl + " with ID '"+ modelIds + "'");

        var ModelClass = modelRegistry.getModel(modelUrl);
        var modelToNotify = modelCache.get(modelUrl, modelIds[modelUrl]);

        if(modelToNotify === null) {
            modelToNotify = new ModelClass(modelIds[modelUrl]);
            modelToNotify.setParentIds(modelIds);
            modelCache.add(modelToNotify);
        }

        var event = {
            model : modelToNotify
        };

        ModelClass.emit("remoteDestroy", event);
    });

    //PUSH
    socket.on('remoteCreate', function (modelUrl, modelIds, modelData) {
        log.debug("push-create for: " + modelUrl + " with ID '"+ modelIds[modelUrl] + "' and data '" + modelData + "'");

        var ModelClass = modelRegistry.getModel(modelUrl);

        var modelToNotify = new ModelClass(modelIds[modelUrl]);
        modelToNotify.setParentIds(modelIds);
        modelToNotify.set(modelData);
        modelCache.add(modelToNotify);

        var event = {
            model : modelToNotify
        };

        ModelClass.emit("remoteCreate", event);
    });
}

module.exports = attachPushHandlers;