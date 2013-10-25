"use strict";

var _ = require("underscore");

var config = require("../shared/config.js"),
    request = require("./helpers/request.js"),
    Class = require("alamid-class"),
    getResourceUrl = require("../shared/helpers/getResourceUrl.js"),
    getUnwriteableFieldsForData = require("../shared/helpers/schema.js").getUnwriteableFieldsForData;

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

        var url = getResourceUrl(this._modelUrl, ids);

        url = config.routes.services + "/" + url;

        //if model is an instance: squeeze the data!
        if (model && typeof model.get === "function") {
            model = model.toObject({
                // ids are incorporate into the url
                //unwriteable fields will be removed
                exclude: _.extend(["id", "ids"], getUnwriteableFieldsForData(model.getSchema(),model.get())),
                schemaType: "shared", // we only send "shared" on the wire
                changedOnly: method === "update"
            });
        }

        request(method, url, model, function onResponse(err, response) {

            //handle request errors
            if (err && !response) {
                response = {
                    status: "error",
                    message: "(alamid) Request-Error '" + err.message + "'",
                    data: {
                        errorCode: "requestError"
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