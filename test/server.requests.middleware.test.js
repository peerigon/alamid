"use strict"; // run code in ES5 strict mode

// Mocks
////////////////////////////////
var serverInitPageShortcutMocks = {
    "../../pages/serveInitPage": function(req, res, next) {
        //so we can test for it
        req.servingPage = true;
        next();
    }
};

var expect = require("expect.js"),
    rewire = require("rewire"),
    parseUrl = require("../lib/server/request/middleware/parseUrl.js"),
    setAjaxFlag = require("../lib/server/request/middleware/setAjaxFlag.js"),
    serveInitPageShortcut = rewire("../lib/server/request/middleware/serveInitPageShortcut.js", serverInitPageShortcutMocks);


describe("parseUrl", function(){
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
       })
    });
});

describe("setAjaxFlag", function(){

    it("should set the ajax-flag to true if x-requested-with header equals XMLHTTPRequest", function (done) {
        var req = { "url" : "http://mydomain.com/myPath", headers : [], parsedURL : {} };
        req.headers["x-requested-with"] = "XMLHttpRequest";

        var res = { headers : [] };

       setAjaxFlag(req, res, function() {
           expect(req.ajax).to.be(true);
           done();
       })
    });

    it("should set the ajax flag to false if x-requested-with header is missing", function (done) {
        var req = { "url" : "http://mydomain.com/myPath", headers : [], parsedURL : {} };
        var res = { headers : [] };

        setAjaxFlag(req, res, function() {
            expect(req.ajax).to.be(false);
            done();
        })
    });

});

describe("serverInitPageShortcut", function(){

    it("should serve the Init page if path = / ", function (done) {
        var req = { "url" : "http://mydomain.com/myPath", headers : [], parsedURL : { pathname : "/" } };
        var res = { headers : [] };

       serveInitPageShortcut(req, res, function() {
           expect(req.servingPage).to.be(true);
           done();
       })
    });

    it("should not serve the Init page if path != / ", function (done) {
        var req = { "url" : "http://mydomain.com/myPath", headers : [], parsedURL : { pathname : "/blabla" } };
        var res = { headers : [] };

        serveInitPageShortcut(req, res, function() {
            expect(req.servingPage).to.be(undefined);
            done();
        })
    });
});