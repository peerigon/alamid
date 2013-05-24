"use strict";

var log = require("../../shared/logger").get("data"),
    Event = require("../../shared/Event.class.js"),
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
    socket.on("remoteCreate", function (url, ids, data) {

        var id = ids[url],
            ModelClass = modelRegistry.getModel(url),
            cache = ModelClass.cache,
            model;

        log.debug("remoteCreate for '" + url + "'");

        model = new ModelClass(id);
        model.setIds(ids);

        delete data.id;
        delete data.ids;

        model.set(data);

        if (cache) {
            cache.set(model.getResourceUrl(), model);
        }

        ModelClass.emit("remoteCreate", new RemoteCreateEvent(ModelClass, model));
    });

    //REMOTE UPDATE
    socket.on("remoteUpdate", function (url, ids, data) {

        var id = ids[url],
            ModelClass = modelRegistry.getModel(url),
            cache = ModelClass.cache,
            resourceUrl,
            model;

        log.debug("remoteUpdate for '" + url + "'");

        if (cache) {
            resourceUrl = ModelClass.getResourceUrl(ids);
            model = cache.get(resourceUrl);
        }

        if (!model) {
            model = new ModelClass(id);
        }

        model.setIds(ids);

        delete data.id;
        delete data.ids;

        model.set(data);

        if (cache) {
            cache.set(resourceUrl, model);
        }

        ModelClass.emit("remoteUpdate", new RemoteUpdateEvent(ModelClass, model));
    });

    //REMOTE DELETE
    socket.on("remoteDestroy", function (url, ids) {

        var ModelClass = modelRegistry.getModel(url),
            cache = ModelClass.cache,
            resourceUrl = ModelClass.getResourceUrl(ids),
            model = null;

        log.debug("remoteDestroy for '" + url + "'");

        if (cache) {
            model = cache.get(resourceUrl);
            cache.remove(resourceUrl);
        }

        ModelClass.emit("remoteDestroy", new RemoteDestroyEvent(ModelClass, model));
    });
}

/**
 * @class RemoteCreateEvent
 * @extends Event
 */
var RemoteCreateEvent = Event.extend("RemoteCreateEvent", {
    name: "RemoteCreateEvent",
    model: null,
    constructor: function (target, model) {
        this._super(target);
        this.model = model;
    }
});

/**
 * @class RemoteUpdateEvent
 * @extends Event
 */
var RemoteUpdateEvent = Event.extend("RemoteUpdateEvent", {
    name: "RemoteUpdateEvent",
    model: null,
    constructor: function (target, model) {
        this._super(target);
        this.model = model;
    }
});

/**
 * @class RemoteDestroyEvent
 * @extends Event
 */
var RemoteDestroyEvent = Event.extend("RemoteDestroyEvent", {
    name: "RemoteDestroyEvent",
    model: null,
    constructor: function (target, model) {
        this._super(target);
        this.model = model;
    }
});

module.exports = subscribeModelHandler;