"use strict";

var log = require("../shared/logger").get("client"),
    modelCache = require("../shared/modelCache.js"),
    modelRegistry = require("../shared/registries/modelRegistry.js");

/**
 * attach push handlers for the connected socket.io client
 * only call this function once.
 * @param {Object} socket
 */
function subscribeModelHandler(socket) {

    //REMOTE CREATE
    socket.on('remoteCreate', function (url, ids, data) {

        var id = ids[url];

        log.debug("remoteCreate for '" + url + "'");

        var ModelClass = modelRegistry.getModel(url);

        var modelToNotify = new ModelClass(id);
        modelToNotify.setParentIds(ids);

        delete data.id;
        delete data.ids;

        modelToNotify.set(data);
        modelCache.add(modelToNotify);

        var event = {
            model : modelToNotify
        };

        ModelClass.emit("remoteCreate", event);
    });

    //REMOTE UPDATE
    socket.on('remoteUpdate', function (url, ids, data) {

        var id = ids[url];

        log.debug("remoteUpdate for '" + url + "'");

        var ModelClass = modelRegistry.getModel(url),
            modelToNotify = modelCache.get(url, id);

        if(modelToNotify === null) {

            modelToNotify = new ModelClass(id);
            modelToNotify.setParentIds(ids);
            modelCache.add(modelToNotify);
        }

        delete data.id;
        delete data.ids;

        var event = {
            model : modelToNotify,
            parentIds : ids,
            data : data
        };

        ModelClass.emit("remoteUpdate", event);
    });

    //REMOTE DELETE
    socket.on('remoteDestroy', function (url, ids) {

        var id = ids[url];

        log.debug("remoteDestroy for '" + url + "'");

        var ModelClass = modelRegistry.getModel(url);
        var modelToNotify = modelCache.get(url, id);

        if(modelToNotify !== null) {

            var event = {
                model : modelToNotify
            };

            ModelClass.emit("remoteDestroy", event);
        }
    });
}

module.exports = subscribeModelHandler;