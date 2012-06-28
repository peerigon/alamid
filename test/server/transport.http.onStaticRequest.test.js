"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    iterateMiddleware = require("../../lib/server/applyMiddleware.js"),
    onStaticRequest = require("../../lib/server/transport/http/onStaticRequest.js"),
    config = require("../../lib/shared/config");


describe("onStaticRequest", function(){

    var req = { "url" : "myUrl", headers : { range : "" }};
    var res = { "url" : "resUrl"};

    var staticFileServer = onStaticRequest[0],
        fileNotFound = onStaticRequest[1];

    //we have an additional middleware in dev mode
    if(config.mode == "development") {
        staticFileServer = onStaticRequest[1];
        fileNotFound = onStaticRequest[2];
    }


    it("should call next if no static file was found", function (done) {
        iterateMiddleware([staticFileServer], req, res, function() {
            done();
        });
    });

    it("should end the request if nothing was found", function (done) {
        res.end = function(bla) {
            done();
        };

        iterateMiddleware([fileNotFound], req, res, function() {
            done(new Error("Not handled"));
        });
    });
});