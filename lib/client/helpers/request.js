"use strict";

var config = require("../../shared/config.js"),
    domAdapter = require("./domAdapter.js"),
    httpRequest = domAdapter.request,
    convertCRUDtoHTTP = require("../../shared/helpers/httpCrud.js").convertCRUDtoHTTP;

/**
 * function makes a request using the default transport (websockets/http)
 * use this function to abstract any connection with the server
 * @param {String} method (post/put/destroy/get)
 * @param {String} url
 * @param {Object} model
 * @param {Function} callback
 */
function request(method, url, model, callback) {
    var socket = request.socket;

    function onHttpResponse(err, responseBody) {
        var response;

        if (err) {
            callback(err);
            return;
        }

        err = null;

        if (typeof responseBody === "string") {
            try {
                response = JSON.parse(responseBody);
            } catch (parseErr) {
                err = parseErr;
                response = responseBody;
            }
        } else {
            response = responseBody;
        }

        callback(err, response);
    }

    if (socket && socket.socket.connected) {
        socket.emit(method, url, model, function(response) {
            //we have no err here
            //same signature as http above needed!
            callback(null, response);
        });
    } else {
        //we have to send via valid http method
        method = convertCRUDtoHTTP(method);
        httpRequest(method, url, model, onHttpResponse);
    }
}

/**
 * The socket.io-instance
 *
 * @type {Socket}
 */
request.socket = null;

module.exports = request;