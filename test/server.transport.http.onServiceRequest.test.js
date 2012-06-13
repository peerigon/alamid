"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    applyMiddleware = require("../lib/server/applyMiddleware.js"),
    onServiceRequest = require("../lib/server/transport/http/onServiceRequest.js");

/*
describe("onServiceRequest", function(){

    var req = { "url" : "myUrl", headers : { range : "" }};
    var res = { "url" : "resUrl"};

    it("should call next if no static file was found", function (done) {

        var staticFileServer = onStaticRequest[1];

        iterateMiddleware([staticFileServer], req, res, function() {
            done();
        });
    });
});
    */