"use strict"; // run code in ES5 strict mode

// Mocks
////////////////////////////////
var mockedConnect = {};
mockedConnect.bodyParser = function () {
    return function(req, res, next) { next(); };
};

var mocks = {
    "connect": mockedConnect
};

var expect = require("expect.js"),
    rewire = require("rewire"),
    iterateMiddleware = require("../lib/server/iterateMiddlewares.js"),
    onRequest = rewire("../lib/server/transport/http/onRequest.js", mocks);


describe("##onRequest", function(){

    it("should parse the url and set the ajax flag", function (done) {

        var req = { "url" : "http://mydomain.com/myPath", headers : [] };
        req.headers["x-requested-with"] = "XMLHttpRequest";
        var res = { headers : [] };

        iterateMiddleware(onRequest, req, res, function(){
            expect(req.parsedURL).to.be.an("object");
            expect(req.ajax).to.be(true);
            done();
        });
    });
});

//TODO check for route with /, howto test?