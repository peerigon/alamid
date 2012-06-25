"use strict";

var connect = require("connect"),
    expect = require("expect.js"),
    handleHttp = require("../../compiled/server/transport/http/handleHttp.js");

var server = connect();

//give connect some middlewares for the routes
handleHttp.init(server);

server.use(connect.static(__dirname + "/server.transport.http/", { maxAge: Infinity }));

describe("onRequest", function(){

    it("should pass everything thru", function () {


    });
});