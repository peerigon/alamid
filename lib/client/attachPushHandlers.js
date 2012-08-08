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
        var modelToNotify = modelCache.get(modelUrl, modelIds[modelUrl]);

        if(modelToNotify !== null) {
            var cancelled = false,
                RemoteUpdateEvent = {
                    preventDefault: function () {
                        cancelled = true;
                    }
                };

            //Model.emit("remoteUpdate", RemoteUpdateEvent);
            modelToNotify.emit("remoteUpdate", RemoteUpdateEvent);
            if (cancelled) {
                return;
            }
            //update date
            modelToNotify.set(modelData); // triggering the "change"-event
        }
    });

    //REMOTE DELETE
    socket.on('remoteDelete', function (modelUrl, modelIds) {
        log.debug("push-delete for: " + modelUrl + " with ID '"+ modelIds + "'");
        var modelToNotify = modelCache.get(modelUrl, modelIds[modelUrl]);

        if(modelToNotify !== null) {
            var cancelled = false,
                RemoteDeleteEvent = {
                    preventDefault: function () {
                        cancelled = true;
                    }
                };

            //Model.emit("remoteDelete", RemoteDeleteEvent);
            modelToNotify.emit("remoteDelete", RemoteDeleteEvent);
            if (cancelled) {
                return;
            }

            //unset all properties
            modelToNotify.removeAll(); // triggering the "change"-event
        }
    });

    //PUSH
    socket.on('remoteCreate', function (modelUrl, modelIds, modelData) {
        log.debug("push-create for: " + modelUrl + " with ID '"+ modelIds[modelUrl] + "' and data '" + modelData + "'");

        var ModelClass = modelRegistry.getModel(modelUrl),
            modelInstance;

        if(ModelClass !== null) {
            modelInstance = new ModelClass(modelIds[modelUrl]);
            modelInstance.set(modelData);

            //cache it!
            modelCache.add(modelInstance);
            //Model.emit("remoteCreate", modelInstance);
        }
    });
}

module.exports = attachPushHandlers;