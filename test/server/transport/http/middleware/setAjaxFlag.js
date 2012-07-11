"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    setAjaxFlag = require("../../../../../lib/server/transport/http/middleware/setAjaxFlag.js");

describe("setAjaxFlag", function(){

    it("should set the ajax-flag to true if x-requested-with header equals XMLHTTPRequest", function (done) {
        var req = { "url" : "http://mydomain.com/myPath", headers : [], parsedURL : {} };
        req.headers["x-requested-with"] = "XMLHttpRequest";

        var res = { headers : [] };

        setAjaxFlag(req, res, function() {
            expect(req.ajax).to.be(true);
            done();
        });
    });

    it("should set the ajax flag to false if x-requested-with header is missing", function (done) {
        var req = { "url" : "http://mydomain.com/myPath", headers : [], parsedURL : {} };
        var res = { headers : [] };

        setAjaxFlag(req, res, function() {
            expect(req.ajax).to.be(false);
            done();
        });
    });
});