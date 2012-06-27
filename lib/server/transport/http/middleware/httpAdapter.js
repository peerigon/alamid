"use strict";

var Request = require("../../../request/Request.class.js"),
    handleRequest = require("../../../request/handleRequest.js"),
    config = require("../../../../shared/config"),
    logger = require("../../../../shared/logger"),
    log = logger.get("server");

function convertHTTPtoCRUD (method) {

    switch(method.toUpperCase()) {
        case "POST":
            return "create";
        case "GET":
            return "read";
        case "PUT":
            return "update";
        case "DELETE":
            return "delete";
    }

    throw new Error("ConvertHTTPtoCRUD: Unsupported method: " + method);
}

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
    }
    catch(e){
        next(e);
        return;
    }

    //send to alamid-request pipeline
    handleRequest(aReq, function(err, aReq, aRes) {

        //Application error
        if(err) {
            res.statusCode = 500;

            var errObj = {
                status : "error",
                message : "Internal Server Error"
            };

            //we append the full error in dev mode
            if(config.isDev){
                errObj.message = "Request failed: " + aReq.getPath() + "with Error: "+ err.message;
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