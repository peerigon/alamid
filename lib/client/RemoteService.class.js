"use strict";

var _ = require("underscore");

var config = require("../shared/config.js"),
    request = require("./helpers/request.js"),
    Class = require("alamid-class");

/**
 * Helper-function to merge urls with given parent IDs
 * makes /blog/comment with id for blog -> blog/1/comment
 * @param {String} url
 * @param {Object} parentIds
 * @return {String}
 */
function getRequestUrl (url, parentIds) {

    var resUrl = "";

    if (url === undefined) {
        throw new Error("(alamid) No Url passed");
    }

    if (config.baseURL !== undefined) {
        resUrl = config.baseURL;
    }

    //TODO get via config
    resUrl += '/services/';

    //nothing to merge here
    if (parentIds === null || _.isEmpty(parentIds)) {
        return resUrl + url;
    }

    var urlSplit = url.split("/"),
        resArray = [];

    for (var i = 0; i < urlSplit.length; i++) {
        resArray.push(urlSplit[i]);
        //is an id defined?
        if (parentIds[urlSplit[i]] !== undefined) {
            resArray.push(parentIds[urlSplit[i]]);
        }
    }
    return resUrl + resArray.join("/");
}

/**
 * calls a remote service using the default transport (websockets or http)
 * @param modelUrl
 * @constructor
 */
var RemoteService = new Class("RemoteService", {

    _modelUrl:null,

    constructor:function (modelUrl) {
        this._modelUrl = modelUrl;
    },
    /**
     * could be used to perform default request
     * @param method
     * @param ids
     * @param model
     * @param callback
     */
    _defaultRequest:function (method, ids, model, callback) {
        var url = getRequestUrl(this._modelUrl, ids);

        //if model is an instance: squeeze the data!
        if (model !== null && typeof(model.get) === "function") {
            model = model.get();
        }

        request(method, url, model, function onResponse (err, response) {

            //handle request errors
            if (err) {
                response = {
                    status:"error",
                    message:"(alamid) Request-Error '" + err.message + "'",
                    data:{
                        error:"requestError"
                    }
                };
            }

            //we only return response
            //that's was the serviceHandler expects
            callback(response);
        });
    },
    create:function (remote, ids, model, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 3) {
            ids = args[0];
            model = args[1];
            callback = args[2];
        }

        this._defaultRequest("create", ids, model, callback);
    },
    read:function (remote, ids, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 2) {
            ids = args[0];
            callback = args[1];
        }

        this._defaultRequest("read", ids, null, callback);
    },
    readCollection:function (remote, ids, params, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 3) {
            ids = args[0];
            params = args[1];
            callback = args[2];
        }

        this._defaultRequest("read", ids, params, callback);
    },
    update:function (remote, ids, model, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 3) {
            ids = args[0];
            model = args[1];
            callback = args[2];
        }

        this._defaultRequest("update", ids, model, callback);
    },
    destroy:function (remote, ids, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if (args.length === 2) {
            ids = args[0];
            callback = args[1];
        }

        this._defaultRequest("destroy", ids, {}, callback);
    }
});

module.exports = RemoteService;