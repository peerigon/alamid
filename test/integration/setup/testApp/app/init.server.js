"use strict";

var alamid = require("alamid"),
    Server = alamid.Server;

var sessionTest= require("./middleware/sessionTest.js");

//start the server
var server = new Server();

server.addRoute(["create", "read", "update", "destroy"], "/services/session*", sessionTest);

var router = server.getRouter();

console.log(router);

server.bootstrap();

server.start();


