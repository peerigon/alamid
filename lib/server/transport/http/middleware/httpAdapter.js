"use strict";

var Request = require("../../../request/Request.class.js"),
    handleRequest = require("../../../request/handleRequest.js"),
    config = require("../../../../shared/config.js"),
    logger = require("../../../../shared/logger.js"),
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
    if (req.method === "GET" && req.parsedURL.query !== undefined) {
        data = req.parsedURL.query;
    }
    else {
        data = req.body;
    }

    try {
        aReq = new Request(convertHTTPtoCRUD(req.method), req.parsedURL.pathname, data);
        aReq.setTransport("http", req);

        //attach session
        if (req.session !== undefined) {
            aReq.setSession(req.session);
        }
    }
    catch (e) {
        next(e);
        return;
    }

    //send to alamid-request pipeline
    handleRequest(aReq, function (err, aReq, aRes) {

        //merge the session back to res-object in order to make it persistent
        var aReqSession = aReq.session;

        if (aReqSession !== null && aReqSession !== undefined) {
            req.session = aReqSession;
        }

        //Error in middleware pipeline are handled via router
        //errors within the middleware stack should be passed to next(new Error(..))
        //have a look at attachAlamidMiddleware.js

        //set header with headers and status code
        res.writeHead(aRes.getStatusCode(), aRes.getHeaders());
        res.write(JSON.stringify(aRes.toJSendBody()), "utf-8");
        res.end();
    });
}

module.exports = httpAdapter;