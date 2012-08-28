"use strict";

var config = require("../shared/config.js"),
    domAdapter = require("./helpers/domAdapter.js"),
    httpRequest = domAdapter.request,
    convertCRUDtoHTTP = require("../shared/helpers/httpCrud.js").convertCRUDtoHTTP;

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

    var app = require("../index.js").app;

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

    if(socket && socket.socket.connected) {
        socket.emit(method, url, model, callback);
    }
    else{
        //we have to send via valid http method
        method = convertCRUDtoHTTP(method);
        httpRequest(method, url, model, onHttpResponse);
    }
}

module.exports = request;