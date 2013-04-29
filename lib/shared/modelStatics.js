"use strict";

var modelCache = require("./modelCache.js"),
    services = require("./registries/serviceRegistry.js"),
    serviceAdapter = require("./helpers/serviceAdapter.js"),
    createModelInstances = require("./helpers/createModelInstances.js"),
    env = require("./env.js");

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

    instance = modelCache.get(ModelClass.prototype.url, ids);

    //if we don't find an instance, we add one!
    if (instance === null) {
        instance = new ModelClass(id);
        //add instance to Cache
        modelCache.add(instance);
    }

    instance.setIds(ids);

    instance.fetch(remote, function (err, response) {

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

    function onServiceResponse(err, response) {

        var models = null;

        if (err) {
            callback(err, null, response);
            return;
        }

        if (response.status === "success" && response.data !== undefined) {
            models = createModelInstances(ids, response.data, ModelClass);
        }

        callback(null, models, response);
    }

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

    serviceAdapter(modelInstance, "readCollection", remote, onServiceResponse);
}

exports.find = find;
exports.findById = findById;