"use strict";

var nodeclass = require("nodeclass"),
    rewire = require("rewire");

nodeclass.registerExtension();

var middleware = require("../../../../../lib/server/request/middleware.js"),
    services = require("../../../../../lib/server/services.js");

middleware.setMiddleware("services", {
    "read test" : function(req, res, next) {
        console.log("running middleware!!!");
        next();

    }
});

services.setServices({
    "test/testService.server.class.js" : {
        "readCollection" : function(model, req, res, callback) {

            console.log("RUNNING SERVICE");
            console.log("reqSession", req.getSession());

            var session = req.getSession();

            if(session.counter === undefined) {
                session.counter = 0;
            }

            session.counter++;

            callback({ "status" : "success", data : { da : "ta" } });
        },
        "read" : function(model, req, res, callback) {

            console.log("RUNNING SERVICE");
            console.log("reqSession", req.getSession());

            callback({ "status" : "success", data : { da : "ta" } });
        }
    }
});

var startServer = require("../../../../../lib/server/startServer");
startServer(9090);