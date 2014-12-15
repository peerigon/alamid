"use strict";

var services = require("./registries/serviceRegistry.js"),
    schemas = require("./registries/schemaRegistry.js"),
    serviceAdapter = require("./helpers/serviceAdapter.js"),
    createModel = require("./helpers/createModel.js"),
    env = require("./env.js"),
    _getResourceUrl = require("./helpers/getResourceUrl.js"),
    Event = require("./Event.class.js"),
    emitErrorEvent = require("./helpers/emitErrorEvent.js"),
    schemaHelpers = require("./helpers/schema.js"),
    config = require("./config.js"),
    _ = require("underscore");

/**
 * Looks up the model's schemas and services and applies it to the prototype.
 * Will be called once per Model-class
 *
 * @this {Class}
 */
function initialize() { /* jshint validthis: true */
    var ModelClass = this,
        url = ModelClass.prototype.url,
        localSchema = ModelClass.prototype._localSchema || schemas.getSchema(url),
        sharedSchema = ModelClass.prototype._sharedSchema || schemas.getSchema(url, "shared");

    if (localSchema) {
        schemaHelpers.applySchema(ModelClass.prototype, localSchema);
        ModelClass.prototype._localSchema = localSchema;
        ModelClass.prototype._sharedSchema = sharedSchema;
    } else if (sharedSchema) {
        schemaHelpers.applySchema(ModelClass.prototype, sharedSchema);
        ModelClass.prototype._sharedSchema = sharedSchema;
    }

    ModelClass.prototype._service = ModelClass.prototype._service || services.getService(url);

    ModelClass.prototype._casting = config.use.casting;
    ModelClass.initialized = true;
}

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
 * @param {Boolean|Object} remote should the remote-service be contacted
 * @param {String|Object|Function} ids the parent IDs
 * @param {String|Number|Function=} id the ID of the model you want to load
 * @param {Function} callback
 * @this {Class}
 */
function findById(remote, ids, id, callback) { /* jshint validthis: true */

    var args = Array.prototype.slice.call(arguments, 0),
        ModelClass = this,
        cache = ModelClass.cache,
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

    } else if (args.length === 2) {
        callback = args[1];
        remote = true;
        id = args[0];

        //User.findById(ids, callback);
        if (typeof id === "object") {
            ids = id;
            id = ids[ModelClass.prototype.url];
        }
        //User.findById(id, callback);
        else {
            ids = {};
            ids[ModelClass.prototype.url] = id;
        }
    }

    if (cache) {
        instance = cache.get(ModelClass.getResourceUrl(ids));
    }

    //if we don't find an instance, we create one!
    if (!instance) {
        instance = new ModelClass(id);
    }

    instance.setIds(ids);

    instance.fetch(remote, function onModelFetch(err, response) {
        if (err) {
            callback(err, null, response);
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
 * @param {Boolean|Object} remote should the remoteService be contacted
 * @param {Object|Function} ids the parent ids for embedded-document finds
 * @param {Object|Function=} params the params you want to select your models by
 * @param {Function=} callback
 * @this {Class}
 */
function find(remote, ids, params, callback) { /* jshint validthis: true */

    var ModelClass = this,
        url = ModelClass.prototype.url,
        service = ModelClass.prototype._service,
        args = Array.prototype.slice.call(arguments, 0),
        modelInstance;

    //check optional args
    if (args.length === 2) {
        ids = args[0];
        callback = args[1];
        remote = true;
        params = {};
    }
    else if (args.length === 3) {
        if (typeof(args[0]) === "object") {
            ids = args[0];
            params = args[1];
            remote = true;
        }
        else {
            remote = args[0];
            ids = args[1];
            params = {};
        }

        callback = args[2];
    }

    // Creates an independent copy of ids
    ids = _.clone(ids);

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
        var models = null,
            err;

        if (response instanceof Error || response.status === "error") {
            if (response instanceof Error) {
                err = response;
            } else {
                err = new Error(response.message);
            }
            emitErrorEvent(ModelClass, new ErrorEvent(ModelClass, null, response));
            callback(err, null, response);
            return;
        }

        if (response.data !== undefined) {
            models = createModel.multiple(ModelClass, response.data, ids);
        }

        callback(null, models, response);
    });
}

/**
 * Generates a resource url for the given ids.
 *
 * @param {Object} ids
 * @returns {String}
 * @this {Function}
 */
function getResourceUrl(ids) { /* jshint validthis: true */
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

exports.initialize = initialize;
exports.find = find;
exports.findById = findById;
exports.getResourceUrl = getResourceUrl;