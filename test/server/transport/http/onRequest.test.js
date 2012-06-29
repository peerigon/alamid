"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    iterateMiddleware = require("../../../../lib/server/applyMiddleware.js");

describe("onRequest", function(){

    it("should parse the url and set the ajax flag", function (done) {

        var onRequest = rewire("../../../../lib/server/transport/http/onRequest.js", false);
        var mockedConnect = {};
        mockedConnect.bodyParser = function () {
            return function(req, res, next) { next(); };
        };

        onRequest.__set__("connect", mockedConnect);

        var req = { "url" : "http://mydomain.com/myPath", headers : [] };
        req.headers["x-requested-with"] = "XMLHttpRequest";
        var res = { headers : [] };

        iterateMiddleware(onRequest, req, res, function(){
            expect(req.parsedURL).to.be.an("object");
            expect(req.ajax).to.be(true);
            done();
        });
    });

    after(function() {
        rewire.reset();
    });
});