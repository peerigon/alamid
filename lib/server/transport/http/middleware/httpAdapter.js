"use strict";

var Request = require("../../../request/Request.class.js"),
    handleRequest = require("../../../request/handleRequest.js");

function convertHTTPtoCRUD (method) {

    switch(method) {
        case "POST":
            return "create";
        case "GET":
            return "read";
        case "PUT":
            return "update";
        case "DELETE":
           return "delete";
    }

    throw new Error("Unsupported method: " + method);
}

function httpAdapter(req, res, next) {

    var aReq;

    //validate if req is valid and can be used for alamid request
    var data = null;

    //we have only one single data attribute
    if(req.method === "GET"){
        data = req.parsedUrl.query;
    }
    else{
        data = req.body;
    }

    try{
        aReq = new Request(req.method, req.parsedURL.pathname, data);
    }
    catch(e){
        next(e);
        return;
    }


    //apply to alamid-request pipeline
    handleRequest(aReq, function(err, aReq, aRes) {

        if(err) {


            next(err);
            return;
        }

        //assign valid status-codes here!

        res.write(aRes.getData(), "utf-8");
        res.end();
    });
}

module.exports = httpAdapter;