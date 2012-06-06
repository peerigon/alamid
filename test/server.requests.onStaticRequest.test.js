"use strict"; // run code in ES5 strict mode

// Mocks
////////////////////////////////
var mockedConnect = {};
mockedConnect.static = function (path, time) {
    return function(req, res, next) {
        next(req, res, next);
    }
};

var mocks = {
    "connect": mockedConnect
};

var expect = require("expect.js"),
    rewire = require("rewire"),
    onStaticRequest = rewire("../lib/server/request/onStaticRequest.js", mocks);


describe("onStaticRequest", function(){

    it("should pass everything thru", function (done) {

        var req = { "url" : "myUrl" };
        var res = { "url" : "resUrl"};

        onStaticRequest(req, res, function(returnedReq, returnedRes, next) {
            expect(returnedReq).to.equal(req);
            expect(returnedRes).to.equal(res);
            done();
        });
    });
});