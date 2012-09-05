"use strict";

var Request = require("../../../request/Request.class.js"),
    handleRequest = require("../../../request/handleRequest.js"),
    config = require("../../../../shared/config"),
    logger = require("../../../../shared/logger"),
    log = logger.get("server"),
    convertHTTPtoCRUD = require("../../../../shared/helpers/httpCrud.js").convertHTTPtoCRUD;

/**
 * accepts http-requests as a middleware, and sends them down the alamid-pipeline
 * @param {!Object} req
 * @param {!Object} res
 * @param {!Function} next
 */
function httpAdapter(req, res, next) {

    var aReq;

    //validate if req is valid and can be used for alamid request
    var data = null;

    //we have only one single data attribute
    if(req.method === "GET" && req.parsedURL.query !== undefined){
        data = req.parsedURL.query;
    }
    else{
        data = req.body;
    }

    try{
        aReq = new Request(convertHTTPtoCRUD(req.method), req.parsedURL.pathname, data);
        aReq.setOriginatedRequest("http", req);

        //attach session
        if(req.session !== undefined) {
            aReq.setSession(req.session);
        }
    }
    catch(e){
        next(e);
        return;
    }

    //send to alamid-request pipeline
    handleRequest(aReq, function(err, aReq, aRes) {

        //merge the session back to res-object in order to make it persistent
        var aReqSession = aReq.getSession();

        if(aReqSession !== null && aReqSession !== undefined) {
            req.session = aReqSession;
        }

        //Error in middleware pipeline
        if(err instanceof Error === true) {
            //default error status-code
            res.statusCode = 400;

            var errObj = {
                status : "error",
                message : "Bad Request."
            };

            //we append the full error in dev mode
            if(config.isDev){
                errObj.message = "(alamid) Request for path '" + aReq.getPath() + "' failed with Error: '" + err.message + "'";
            }
            else{
                log.error("Request failed: " + aReq.getPath(), errObj);
            }

            res.write(JSON.stringify(errObj), "utf-8");
            res.end();
            return;
        }

        //set header with headers and status code
        res.writeHead(aRes.getStatusCode(), aRes.getHeaders());
        res.write(JSON.stringify(aRes.getResBody()), "utf-8");
        res.end();
    });
}

module.exports = httpAdapter;