"use strict";

var config = require("../shared/config.js"),
    domAdapter = require("../client/domAdapter.js"),
    request = domAdapter.request;

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

function RemoteService(modelUrl) {

    function onRemoteServiceResponse(callback) {
        return function handleResponse(err, rawResponse) {
            var response;

            if(err) {
                callback(err);
                return;
            }

            try {
                response = domAdapter.JSONparse(rawResponse);
            } catch (err) {
                response = rawResponse;
            }
            callback(response);
        };
    }

    this.create = function(model, callback) {
        var url = getRequestUrl(model.getUrl(), model.getParentIds());
        model = model.get();
        request("put", url, model, onRemoteServiceResponse(callback));
    };

    this.read = function(model, callback) {
        var url = getRequestUrl(model.getUrl(), model.getParentIds());
        model = model.get();
        request("get", url, model, onRemoteServiceResponse(callback));
    };

    this.update = function(model, callback) {
        var url = getRequestUrl(model.getUrl(), model.getParentIds());
        model = model.get();
        request("post", url, model, onRemoteServiceResponse(callback));
    };

    this.delete = function(model, callback) {
        var url = getRequestUrl(model.getUrl(), model.getParentIds());
        model = model.get();
        request("delete", url, model, onRemoteServiceResponse(callback));
    };
}

exports.RemoteService = RemoteService;
