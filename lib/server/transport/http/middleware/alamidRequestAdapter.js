"use strict";

var Request = require("../../../request/Request.class.js");

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

    throw Error("Unsupported method: " + method);
}

function alamidRequestAdapter(req, res, next) {

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
        var alamidRequest = new Request(req.method, req.parsedURL.pathname, data);
    }
    catch(e){
        next(e);
        return;
    }


    //apply to alamid-request pipeline
    //handleRequest(alamidRequest, function(alamidReq, alamidRes)

    //return alamidReq to req
    //req = convertAlamidResToHttpReq(alamidRes);

    req.alamidReq = alamidRequest;

    next(null);

}

module.exports = alamidRequestAdapter;