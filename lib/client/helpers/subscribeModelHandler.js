"use strict";

var log = require("../../shared/logger").get("data"),
    modelCache = require("../../shared/modelCache.js"),
    modelRegistry = require("../../shared/registries/modelRegistry.js");

/**
 * attach push handlers for the connected socket.io client
 * only call this function once.
 * @param {Object} socket
 */
function subscribeModelHandler(socket) {

    if(!socket) {
        throw new Error("(alamid) subscribeModelHandler is only supported with Websockets enabled.");
    }

    //REMOTE CREATE
    socket.on('remoteCreate', function (url, ids, data) {

        var id = ids[url];

        log.debug("remoteCreate for '" + url + "'");

        var ModelClass = modelRegistry.getModel(url);

        var modelToNotify = new ModelClass(id);
        modelToNotify.setIds(ids);

        delete data.id;
        delete data.ids;

        modelToNotify.set(data);
        modelCache.add(modelToNotify);

        var event = {
            model : modelToNotify
        };

        ModelClass.emit("remoteCreate", event, ModelClass);
    });

    //REMOTE UPDATE
    socket.on('remoteUpdate', function (url, ids, data) {

        var id = ids[url],
            ModelClass = modelRegistry.getModel(url),
            modelToNotify = modelCache.get(url, ids);

        log.debug("remoteUpdate for '" + url + "'");

        if (modelToNotify === null) {

            modelToNotify = new ModelClass(id);
            modelToNotify.setIds(ids);
            modelCache.add(modelToNotify);
        }

        delete data.id;
        delete data.ids;

        var event = {
            model : modelToNotify,
            parentIds : ids,
            data : data
        };

        ModelClass.emit("remoteUpdate", event, ModelClass);
    });

    //REMOTE DELETE
    socket.on('remoteDestroy', function (url, ids) {

        var ModelClass = modelRegistry.getModel(url),
            modelToNotify = modelCache.get(url, ids),
            event;

        log.debug("remoteDestroy for '" + url + "'");

        if (modelToNotify !== null) {

            event = {
                model : modelToNotify
            };

            ModelClass.emit("remoteDestroy", event, ModelClass);
        }
    });
}

module.exports = subscribeModelHandler;