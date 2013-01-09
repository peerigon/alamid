"use strict";

var config = require("../../shared/config.js"),
    domAdapter = require("./domAdapter.js"),
    httpRequest = domAdapter.request,
    convertCRUDtoHTTP = require("../../shared/helpers/httpCrud.js").convertCRUDtoHTTP,
    app;

/**
 * function makes a request using the default transport (websockets/http)
 * use this function to abstract any connection with the server
 * @param {String} method (post/put/destroy/get)
 * @param {String} url
 * @param {Object} model
 * @param {Function} callback
 */
function request(method, url, model, callback) {

    //require in function due to circular dependencies
    app = app || require("../../index.js").app;

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


        if(typeof(responseBody) === "string") {
            try {
                response = domAdapter.parseJSON(responseBody);
            } catch (err) {
                response = responseBody;
            }
        }
        else {
            response = responseBody;
        }

        //TODO should return null, response?
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