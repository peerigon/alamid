"use strict";

var config = require("../../shared/config.js"),
    domAdapter = require("./domAdapter.js"),
    httpRequest = domAdapter.request,
    qs = require("querystring"),
    convertCRUDtoHTTP = require("../../shared/helpers/httpCrud.js").convertCRUDtoHTTP;

var pendingReadRequests = {};

/**
 * function makes a request using the default transport (websockets/http)
 * use this function to abstract the transport for server-communication
 * read requests will be debounced.
 *
 * @param {String} method (create/read/update/destroy)
 * @param {String} url
 * @param {Object} data
 * @param {Function} callback
 */
function request(method, url, data, callback) {

    var socket = request.socket;

    if(config.host) {
        //TODO check for protocol
        url = "http://" + config.host + url;
    }

    function respond(err, response) {
        var callbacks;

        if (method !== "read") {
            callback(err, response);
            return;
        }

        callbacks = pendingReadRequests[url];
        delete pendingReadRequests[url];

        callbacks.forEach(function(responseCallback) {
            responseCallback(err, response);
        });
    }

    function onHttpResponse(err, responseBody) {
        var response,
            parseErr;

        if (typeof responseBody === "string") {
            try {
                response = JSON.parse(responseBody);
            } catch (err) {
                parseErr = err;
            }
        } else {
            response = responseBody;
        }

        respond(err || parseErr || null, response || null);
    }

    if (method === "read") {

        //data must be query string for reads
        if (data) {
            url += "?" + qs.stringify(data);
        }

        //is there already an identical request?
        if(pendingReadRequests[url]) {
            pendingReadRequests[url].push(callback);
            return;
        }

        pendingReadRequests[url] = [callback];
    }

    if (socket && socket.socket.connected) {
        socket.emit(method, url, data, function (response) {
            if (response.status === "success") {
                respond(null, response);
            } else {
                respond(new Error(response.data.message), response);
            }
        });
    } else {
        //we have to send via valid http method
        httpRequest(convertCRUDtoHTTP(method), url, data, onHttpResponse);
    }
}

/**
 * The socket.io-instance
 *
 * @type {Socket}
 */
request.socket = null;

module.exports = request;