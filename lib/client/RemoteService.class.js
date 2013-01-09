"use strict";

var _ = require("underscore");

var config = require("../shared/config.js"),
    request = require("./helpers/request.js");

/**
 * Helper-function to merge urls with given parent IDs
 * makes /blog/comment with id for blog -> blog/1/comment
 * @param {String} url
 * @param {Object} parentIds
 * @return {String}
 */
function getRequestUrl(url, parentIds){

    var resUrl = "";

    if(url === undefined) {
        throw new Error("(alamid) No Url passed");
    }

    if(config.baseURL !== undefined) {
        resUrl = config.baseURL;
    }

    resUrl += '/services/';

    //nothing to merge here
    if(parentIds === null || _.isEmpty(parentIds)) {
        return resUrl + url;
    }

    var urlSplit = url.split("/"),
        resArray = [];

    for(var i = 0; i < urlSplit.length; i++) {
        resArray.push(urlSplit[i]);
        //is an id defined?
        if(parentIds[urlSplit[i]] !== undefined) {
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
function RemoteService(modelUrl) {
    /**
     * could be used to perform default request
     * @param method
     * @param model
     * @param callback
     */
    function defaultRequest(method, ids, model, callback) {
        var url = getRequestUrl(modelUrl, ids);

        //if model is an instance: squeeze the data!
        if(model !== null && typeof(model.get) === "function") {
            model = model.get();
        }

        request(method, url, model, callback);
    }

    this.create = function(remote, ids, model, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if(args.length === 3) {
            remote = true;
            ids = args[0];
            model = args[1];
            callback = args[2];
        }

        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("create", ids, model, callback);
    };

    this.read = function(remote, ids, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if(args.length === 2) {
            remote = true;
            ids = args[0];
            callback = args[1];
        }

        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("read", ids, null, callback);
    };

    this.readCollection = function(remote, ids, params, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if(args.length === 3) {
            remote = true;
            ids = args[0];
            params = args[1];
            callback = args[2];
        }

        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("read", ids, params, callback);
    };


    this.update = function(remote, ids, model, callback) {


        var args = Array.prototype.slice.call(arguments, 0);

        if(args.length === 3) {
            remote = true;
            ids = args[0];
            model = args[1];
            callback = args[2];
        }

        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("update", ids, model, callback);
    };

    this.destroy = function(remote, ids, callback) {

        var args = Array.prototype.slice.call(arguments, 0);

        if(args.length === 2) {
            remote = true;
            ids = args[0];
            callback = args[1];
        }

        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("destroy", ids, {}, callback);
    };
}

module.exports = RemoteService;
