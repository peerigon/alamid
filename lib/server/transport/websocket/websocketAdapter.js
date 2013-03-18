"use strict";

var Request = require("../../request/Request.class.js"),
    handleRequest = require("../../request/handleRequest.js");

/**
 * converts a websocket-request to a alamid-request and send it down the pipeline
 * results are being converted to a websocket callback
 * @param {!Object} socket
 * @param {!String} method
 * @param {!Object} sessionData
 * @param {!String} url
 * @param {Object} data
 * @param {!Function} callback
 */
function websocketAdapter(socket, method, sessionData, url, data, callback) {

    var aReq;

    try {
        aReq = new Request(method, url, data);
        aReq.setTransport("websocket", socket);

        //attach session
        if (sessionData !== null && sessionData !== undefined) {
            aReq.session = sessionData;
        }
    }
    catch (e) {
        callback(
            {
                status : "error",
                message : "(alamid) Could not create valid Request for URL '" + url + "'"
            }
        );
        return;
    }

    //send to alamid-request pipeline
    handleRequest(aReq, function onHandleRequestCallback(err, aReq, aRes) {

        //save session
        aReq.session.save();

        //Error in middleware pipeline are handled via router
        //errors within the middleware stack should be passed to next(new Error(..))
        //have a look at attachAlamidMiddleware.js
        callback(aRes.toJSendBody());
    });
}

module.exports = websocketAdapter;
