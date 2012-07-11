"use strict";

var expect = require("expect.js"),
    rewire = require("rewire");

describe("serveInitPageShortcut", function(){

    var serveInitPageShortcut = rewire("../../../../../lib/server/transport/http/middleware/serveInitPageShortcut.js", false);

    serveInitPageShortcut.__set__("serveInitPage", function(req, res, next) {
        //so we can test for it
        req.servingPage = true;
        next();
    });


    it("should serve the Init page if path = / ", function (done) {

        var req = { "url" : "http://mydomain.com/myPath", headers : [], parsedURL : { pathname : "/" } };
        var res = { headers : [] };

        serveInitPageShortcut(req, res, function() {
            expect(req.servingPage).to.be(true);
            done();
        });
    });

    it("should not serve the Init page if path != / ", function (done) {
        var req = { "url" : "http://mydomain.com/myPath", headers : [], parsedURL : { pathname : "/blabla" } };
        var res = { headers : [] };

        serveInitPageShortcut(req, res, function() {
            expect(req.servingPage).to.be(undefined);
            done();
        });
    });
});