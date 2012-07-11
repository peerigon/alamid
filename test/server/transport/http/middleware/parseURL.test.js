"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    parseUrl = require("../../../../../lib/server/transport/http/middleware/parseURL.js");

describe("parseURL", function(){
    it("should set parsedURL on req-object", function (done) {
        var req = { "url" : "http://mydomain.com/myPath", headers : [] };
        req.headers["x-requested-with"] = "XMLHttpRequest";
        var res = { headers : [] };

        var parsedUrl = { protocol: 'http:',
            slashes: true,
            host: 'mydomain.com',
            hostname: 'mydomain.com',
            href: 'http://mydomain.com/myPath',
            search: '',
            query: {},
            pathname: '/myPath',
            path: '/myPath'
        };

        parseUrl(req, res, function() {
            expect(req.parsedURL).to.be.an("object");
            expect(req.parsedURL.pathname).to.be(parsedUrl.pathname);
            done();
        });
    });
});