"use strict";

var Request = require("../../request/Request.class.js"),
    handleRequest = require("../../request/handleRequest.js"),
    config = require("../../../shared/config"),
    logger = require("../../../shared/logger"),
    log = logger.get("server");

/**
 * converts a websocket-request to a alamid-request and send it down the pipeline
 * results are being converted to a websocket callback
 * @param {!String} method
 * @param {!Object} sessionData
 * @param {!String} url
 * @param {Object} data
 * @param {!Function} callback
 */
function websocketAdapter(socket, method, sessionData, url, data, callback) {

    log.debug("Websocket-Adapter received request: '" + method + "' '" + url + "'");

    var aReq;

    try{
        aReq = new Request(method, url, data);
        aReq.setTransport("websocket", socket);

        //attach session
        if(sessionData !== null && sessionData !== undefined) {
            aReq.setSession(sessionData);
        }
    }
    catch(e){
        callback(
            {
                status : "error",
                message: "(alamid) Could not create valid Request-object for URL '" + url + "'"
            }
        );
        return;
    }

    //send to alamid-request pipeline
    handleRequest(aReq, function onHandleRequestCallback(err, aReq, aRes) {

        //save session
        var session = aReq.getSession();
        session.save();

        //Error in middleware pipeline
        if(err instanceof Error === true) {
            log.debug("Error websocket-request '" + aReq.getPath() + "'");

            var errObj = {
                status : "error",
                message : "Bad Request"
            };

            //we append the full error in dev mode
            if(config.isDev){
                errObj.message = "(alamid) Request failed for path '" + aReq.getPath() + "' with Error: '"+ err.message + "'";
            }
            else{
                log.error("Request failed: " + aReq.getPath(), errObj);
            }

            callback(errObj);
            return;
        }

        log.debug("SUCCESS websocket-request '" + aReq.getPath() + "'");

        callback(aRes.getResBody());
    });
}

module.exports = websocketAdapter;
