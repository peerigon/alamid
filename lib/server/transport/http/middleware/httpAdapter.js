"use strict";

var Request = require("../../../request/Request.class.js"),
    handleRequest = require("../../../request/handleRequest.js");

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

    //apply to alamid-request pipeline
    handleRequest(aReq, function(err, aReq, aRes) {

        var resData = "";
        //TODO convert back to RES with JSON-format
        //TODO end request here with proper status-codes etc
        if(err) {
            res.write(err.message, "utf-8");
            res.end();
            return;
        }

        if(typeof aRes.getJSONData() === "string") {
            resData = aRes.getJSONData();
        }
        //assign valid status-codes here!
        res.write(resData, "utf-8");
        res.end();
    });
}

module.exports = httpAdapter;