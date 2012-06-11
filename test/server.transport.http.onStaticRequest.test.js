"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    iterateMiddleware = require("../lib/server/iterateMiddlewares.js"),
    onStaticRequest = require("../lib/server/transport/http/onStaticRequest.js");


describe("onStaticRequest", function(){

    var req = { "url" : "myUrl", headers : { range : "" }};
    var res = { "url" : "resUrl"};

    it("should call next if no static file was found", function (done) {

        var staticFileServer = onStaticRequest[1];

        iterateMiddleware([staticFileServer], req, res, function() {
            done();
        });
    });

    it("should end the request if nothing was found", function (done) {

        var fileNotFound = onStaticRequest[2]; //thats shitty

        res.end = function(bla) {
            done();
        };

        iterateMiddleware([fileNotFound], req, res, function() {
            done(new Error("Not handled"));
        });
    });

});