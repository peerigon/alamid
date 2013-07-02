"use strict";

var services = require("./registries/serviceRegistry.js"),
    serviceAdapter = require("./helpers/serviceAdapter.js"),
    createModelInstances = require("./helpers/createModelInstances.js"),
    env = require("./env.js"),
    _getResourceUrl = require("./helpers/getResourceUrl.js"),
    Event = require("./Event.class.js"),
    emitErrorEvent = require("./helpers/emitErrorEvent.js");

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
 * @param {Boolean=true} remote should the remote-service be contacted
 * @param {Object=} ids the parent IDs
 * @param {String|Number} id the ID of the model you want to load
 * @param {Function} callback
 */
function findById(remote, ids, id, callback) {

    var args = Array.prototype.slice.call(arguments, 0),
        ModelClass = this,
        cache = ModelClass.cache,
        resourceUrl,
        instance;

    if (args.length === 3) {
        callback = args[2];

        //User.findById(ids, id, callback);
        if (typeof args[0]  === "object") {
            ids = args[0];
            remote = true;
        }
        //User.findById(remote, id, callback);
        else {
            ids = {};
        }

        id = args[1];
        ids[ModelClass.prototype.url] = id;

    //User.findById(id, callback);
    } else if (args.length === 2) {
        callback = args[1];
        remote = true;
        id = args[0];
        ids = {};
        ids[ModelClass.prototype.url] = id;
    }

    if (cache) {
        resourceUrl = ModelClass.getResourceUrl(ids);
        instance = cache.get(resourceUrl);
    }

    //if we don't find an instance, we create one!
    if (!instance) {
        instance = new ModelClass(id);
    }

    instance.setIds(ids);

    instance.fetch(remote, function onModelFetch(err, response) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, instance, response);
    });
}

/**
 * Find a collection of models that match params and ids
 *
 * User.find({ age : ">10"}, onFind);
 *
 * Comment.find({ blogPost : 1 }, { authorId : 3 }, onFind);
 *
 * //don't contact remoteServices
 * Comment.find(false, { blogPost : 1 }, { authorId : 3 }, onFind);
 *
 * @param {Boolean=true} remote should the remoteService be contacted
 * @param {Object=} ids the parent ids for embedded-document finds
 * @param {Object} params the params you want to select your models by
 * @param {Function} callback
 *
 */
function find(remote, ids, params, callback) {

    var ModelClass = this,
        url = ModelClass.prototype.url,
        service = services.getService(url),
        args = Array.prototype.slice.call(arguments, 0),
        modelInstance;

    //check optional args
    if (args.length === 2) {
        params = args[0];
        callback = args[1];
        remote = true;
        ids = {};
    }
    else if (args.length === 3) {
        if (typeof(args[0]) === "object") {
            ids = args[0];
            remote = true;
        }
        else {
            ids = {};
            remote = args[0];
        }

        params = args[1];
        callback = args[2];
    }

    // Creates an independent copy via prototype inheritance
    ids = Object.create(ids);

    //that's a faked instance to use the
    //existing mechanism to extract data
    //might be changed soon...
    modelInstance = {
        getService : function () {
            return service;
        },
        getIds : function () {
            return ids;
        },
        getUrl : function () {
            return url;
        },
        getParams : function () {
            return params;
        }
    };

    serviceAdapter(modelInstance, "readCollection", remote, function onServiceResponse(response) {
        var models = null;

        if (response instanceof Error) {
            emitErrorEvent(ModelClass, new ErrorEvent(ModelClass, null, response));
            callback(response);
            return;
        }

        if (response.data !== undefined) {
            models = createModelInstances(ids, response.data, ModelClass);
        }

        callback(null, models, response);
    });
}

function getResourceUrl(ids) {
    return _getResourceUrl(this.prototype.url, ids);
}

/**
 * @class ErrorEvent
 * @extends Event
 */
var ErrorEvent = Event.extend("ErrorEvent", {
    name: "ErrorEvent",
    model: null,
    response: null,
    constructor: function (target, model, response) {
        this._super(target);
        this.model = model;
        this.response = response;
    }
});

exports.find = find;
exports.findById = findById;
exports.getResourceUrl = getResourceUrl;