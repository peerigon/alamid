"use strict";

var config = require("../shared/config.js"),
    domAdapter = require("./helpers/domAdapter.js"),
    httpRequest = domAdapter.request,
    convertCRUDtoHTTP = require("../shared/helpers/httpCrud.js").convertCRUDtoHTTP,
    app = require("./index.js").app;

/**
 * function makes a request using the default transport (websockets/http)
 * use this function to abstract any connection with the server
 * @param {String} method (post/put/delete/get)
 * @param {String} url
 * @param {Object} model
 * @param {Function} callback
 */
function request(method, url, model, callback) {

    var socket = null;

    if(app !== undefined) {
        socket = app.getSocket();
    }


    function onHttpResponse(err, responseBody) {
        var response;

        if(err) {
            callback(err);
            return;
        }

        try {
            response = domAdapter.JSONparse(responseBody);
        } catch (err) {
            response = responseBody;
        }

        callback(response);
    }

    if(socket && socket.connected) {
        socket.emit(method, url, model, callback);
    }
    else{
        //we have to send via valid http method
        method = convertCRUDtoHTTP(method);
        httpRequest(method, url, model, onHttpResponse);
    }
}

/**
 * Helper-function to merge urls with given parent IDs
 * makes /blog/comment with id for blog -> blog/1/comment
 * @param {String} url
 * @param {Object} parentIds
 * @return {String}
 */
function getRequestUrl(url, parentIds){
    if(url === undefined) {
        throw new Error("(alamid) No Url passed");
    }

    var resUrl = config.baseURL + '/services/';

    //nothing to merge here
    if(parentIds === null) {
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
    function defaultRequest(method, model, callback) {
        var url = getRequestUrl(model.getUrl(), model.getParentIds());
        model = model.get();
        request(method, url, model, callback);
    }

    this.create = function(remote, model, callback) {
        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("create", model, callback);
    };

    this.read = function(remote, model, callback) {
        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("get", model, callback);
    };

    this.update = function(remote, model, callback) {
        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("update", model, callback);
    };

    this.delete = function(remote, model, callback) {
        if(remote === false) {
            callback(new Error("(alamid) No client service found. But using remote=false disables automatic server-request calling."));
            return;
        }
        defaultRequest("delete", model, callback);
    };
}

exports.RemoteService = RemoteService;
exports.request = request;
