"use strict"; // run code in ES5 strict mode



require("./testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    rewire = require("rewire"),
    parseUrl = require("../compiled/server/transport/http/middleware/parseURL.js"),
    setAjaxFlag = require("../compiled/server/transport/http/middleware/setAjaxFlag.js"),
    serveInitPageShortcut = rewire("../compiled/server/transport/http/middleware/serveInitPageShortcut.js"),
    alamidRequestAdapter = rewire("../compiled/server/transport/http/middleware/alamidRequestAdapter.js");

serveInitPageShortcut.__set__("serveInitPage", function(req, res, next) {
    //so we can test for it
    req.servingPage = true;
    next();
});


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

describe("alamidRequestAdapter", function(){

    it("should hand the request on to alamidRequest Adapter if everything is alright", function (done) {

        var dummyData = { "da" : "ta" };

        var req = {
            "url" : "http://mydomain.com/services/blogpost",
            headers : [],
            parsedURL : {
                pathname : "/services/blogpost"
            },
            method : "PUT",
            body : dummyData };

        var res = {
            headers : []
        };

        alamidRequestAdapter.__set__("Request", function(method, path, data){
            expect(method).to.be("PUT");
            expect(path).to.be("/services/blogpost");
            expect(data).to.be(dummyData);
            done();
            return;
        });

        alamidRequestAdapter(req, res, function(err) {
            if(err !== null){
               done(err);
           }
        });
    });


    it("should next with an error if the request could not be converted", function (done) {

        var dummyData = { "da" : "ta" };

        var req = {
            "url" : "http://mydomain.com/services/blogpost",
            headers : [],
            parsedURL : {
                pathname : "/services/blogpost"
            },
            method : "BLA",
            body : { "bla" : "bla" }
           };

        var res = {
            headers : []
        };


        alamidRequestAdapter.__set__("Request", function(method, path, data){
            throw new Error("Wrong params");
        });


        alamidRequestAdapter(req, res, function(err) {
            expect(err).to.be.an("object");
            done();
        });
    });
});