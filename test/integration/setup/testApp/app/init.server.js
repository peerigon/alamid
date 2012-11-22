"use strict";

var alamid = require("alamid"),
    Server = alamid.Server;

//start the server
var server = new Server();

function sessionTest(req, res, next) {

    console.log("session test called");

    var sess = req.getSession();

    if(sess.counter === undefined) {
        sess.counter = 0;
    }

    sess.counter++;
    //we pass it via IDs because it's the only way for read
    req.setIds([sess.counter]);
    next();
}

server.addRoute(["create", "update", "read", "destroy"], "/services/session*", sessionTest);

var router = server.getRouter();

server.bootstrap();

server.start();


