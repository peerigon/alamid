"use strict";

var alamid = require("alamid"),
    Server = alamid.Server;

var sessionTest= require("./middleware/sessionTest.js");

//start the server
var server = new Server();

server.addRoute(["create", "update", "read", "destroy"], "/services/session*", sessionTest);

server.bootstrap();

server.start();


