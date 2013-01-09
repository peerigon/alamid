"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    middler = require("middler");

describe("onRequest", function(){

    it("should parse the url", function (done) {

        var httpMiddleware = rewire("../../../../lib/server/transport/http/httpMiddleware.js");

        var mockedConnect = {
            bodyParser : function () {
                return function(req, res, next) {
                    next();
                }
            }
        };

        httpMiddleware.__set__("connect", mockedConnect);

        var req = { url : "http://mydomain.com/myPath", headers : [] };
        req.headers["x-requested-with"] = "XMLHttpRequest";

        var res = {
            headers : [],
            removeListener : function() {},
            once : function() {}
        };

        var router = middler()
            //applied on every request
            .add(httpMiddleware.request);

        router.handler(req, res, function(err){
            expect(req.parsedURL).to.be.an("object");
            done();
        });
    });

});