"use strict";

var Response = require("./Response.class.js"),
    runService = require("./middleware/runService.js");

function handleRequest(req, callback) {


    var res = new Response();

    if(req.getType() === "service") {

        runService(req, res, function() {
            callback(req, res);
        });

    }
    else if(req.getType() === "validator") {

        callback(req, res);
    }
    else{
        callback(req, res);
    }
}

module.exports = handleRequest;