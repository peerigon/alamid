"use strict"; // run code in ES5 strict mode

require("./testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    rewire = require("rewire"),
    parseUrl = require("../../compiled/server/transport/http/middleware/parseURL.js"),
    setAjaxFlag = require("../../compiled/server/transport/http/middleware/setAjaxFlag.js"),
    Response = require("../../compiled/server/request/Response.class.js");

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
        });
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

describe("serverInitPageShortcut", function(){

    var serveInitPageShortcut = rewire("../../compiled/server/transport/http/middleware/serveInitPageShortcut.js", false);
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

describe("httpAdapter", function(){

    afterEach(function() {
        rewire.reset();
    });

    var httpAdapter = rewire("../../compiled/server/transport/http/middleware/httpAdapter.js", false);

    it("should hand the request on to the httpAdapter if everything is alright", function (done) {

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
            headers : [],
            write : function(data, encoding) {
                expect(data).to.eql(JSON.stringify(dummyData));
                expect(encoding).to.be("utf-8");
            },
            end : function() {
                done();
            }
        };

        httpAdapter.__set__("handleRequest", function(aReq, callback) {

            var aRes = new Response();
            aRes.setData({ "da" : "ta"});

            callback(null, aReq, aRes);
        });

        httpAdapter.__set__("Request", function(method, path, data){
            expect(method).to.be("update");
            expect(path).to.be("/services/blogpost");
            expect(data).to.be(dummyData);
        });

        httpAdapter(req, res, function(err) {
            if(err !== null){
                //this case should not happen
                done(err);
            }
        });
    });


    it("should next with an error if the request could not be converted", function (done) {

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
            headers : [],
            write : function() {
            },
            end : function() {
                done(new Error("This path should not be reached"));
            }
        };

        httpAdapter.__set__("Request", function(){
            throw new Error("Wrong params");
        });

        httpAdapter(req, res, function(err) {
            expect(err).to.be.an("object");
            done();
        });
    });
});