"use strict";

var _ = require("underscore");

var config = require("../shared/config.js"),
    routes,
    request = require("./helpers/request.js"),
    Class = require("alamid-class");

/**
 * Helper-function to merge urls with given parent IDs
 * makes /blog/comment with id for blog -> blog/1/comment
 * @param {String} modelUrl
 * @param {Object} parentIds
 * @return {String}
 */
function getRessourceUrl(modelUrl, parentIds) {
    var ressourceUrl = "",
        partialModelUrl = "",
        key = "",
        id,
        urlSplit,
        i;

    //routes is defined after app-init
    routes = config.routes;

    if (modelUrl === undefined) {
        throw new Error("(alamid) Cannot start model request: No model url passed.");
    }

    if (config.baseURL !== undefined) {
        ressourceUrl = config.baseURL;
    }

    ressourceUrl += routes.services;
    urlSplit = modelUrl.split("/");

    for (i = 0; i < urlSplit.length; i++) {
        key = urlSplit[i];
        ressourceUrl += "/" + key;
        partialModelUrl += key;

        if (parentIds.hasOwnProperty(partialModelUrl) === false) {
            if (i === urlSplit.length - 1) {
                // We've reached the end.
                // Some requests (e.g. "create") don't require an id at the end of the url
                continue;
            }

            throw new Error("(alamid) Cannot start model request: Parent id of '" + partialModelUrl + "' is missing.");
        }

        ressourceUrl += "/" + parentIds[partialModelUrl];
        partialModelUrl += "/";
    }

    return ressourceUrl;
}

/**
 * calls a remote service using the default transport (websockets or http)
 * @param modelUrl
 * @constructor
 */
var RemoteService = new Class("RemoteService", {

    _modelUrl : null,

    constructor : function (modelUrl) {
        this._modelUrl = modelUrl;
    },
    /**
     * could be used to perform default request
     * @param method
     * @param ids
     * @param model
     * @param callback
     */
    _defaultRequest : function (method, ids, model, callback) {

        var url = getRessourceUrl(this._modelUrl, ids);

        //if model is an instance: squeeze the data!
        if (model !== null && typeof(model.get) === "function") {

            //only changed attributes on update
            if (method === "update") {
                model = model.getChanged();
            }
            //otherwise all data
            else {
                model = model.get();
            }
        }

        request(method, url, model, function onResponse(err, response) {

            //handle request errors
            if (err) {
                response = {
                    status : "error",
                    message : "(alamid) Request-Error '" + err.message + "'",
                    data : {
                        error : "requestError"
                    }
                };
            }

            //we only return response
            //that's was the serviceHandler expects
            callback(response);
        });
    },
    create : function (remote, ids, model, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 3) {
            ids = args[0];
            model = args[1];
            callback = args[2];
        }

        this._defaultRequest("create", ids, model, callback);
    },
    read : function (remote, ids, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 2) {
            ids = args[0];
            callback = args[1];
        }

        this._defaultRequest("read", ids, null, callback);
    },
    readCollection : function (remote, ids, params, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 3) {
            ids = args[0];
            params = args[1];
            callback = args[2];
        }

        this._defaultRequest("read", ids, params, callback);
    },
    update : function (remote, ids, model, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 3) {
            ids = args[0];
            model = args[1];
            callback = args[2];
        }

        this._defaultRequest("update", ids, model, callback);
    },
    destroy : function (remote, ids, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 2) {
            ids = args[0];
            callback = args[1];
        }

        this._defaultRequest("destroy", ids, {}, callback);
    }
});

module.exports = RemoteService;