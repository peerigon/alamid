"use strict";

var expect = require("expect.js"),
    rewire = require("rewire");

describe("remoteService", function () {

    var RemoteService;

    beforeEach(function () {
        RemoteService = rewire("../../lib/client/RemoteService.class.js");
        //mocking the routes
        RemoteService.__set__("config", {
            routes : {
                services : "services/",
                validators : "validators/"
            }
        });
    });

    var model = {
        getUrl : function () {
            return "blogpost";
        },
        getIds : function () {
            return null;
        },
        toJSON : function () {
            return JSON.stringify({ da : "ta "});
        },
        get : function () {
            return { da : "ta" };
        }
    };

    it("should return a valid RemoteService", function () {
        var serviceAdapter = new RemoteService("blogpost");
        expect(serviceAdapter.read).to.be.a("function");
        expect(serviceAdapter.create).to.be.a("function");
        expect(serviceAdapter.update).to.be.a("function");
        expect(serviceAdapter.destroy).to.be.a("function");
    });

    it("should pass the right data to the dom-adapter request", function (done) {

        var requestMock = function (method, url, model, callback) {
            expect(method.toLowerCase()).to.be("create");
            expect(url).to.contain("services/blogpost");
            expect(model).to.eql({ da : "ta"});
            callback();
        };

        RemoteService.__set__("request", requestMock);

        var serviceAdapter = new RemoteService("blogpost");

        serviceAdapter.create(true, model, function (response) {
            done();
        });
    });

    it("should resolve the URL with parentIDs for the request", function (done) {

        var requestMock = function (method, url, model, callback) {
            expect(method.toLowerCase()).to.be("update");
            expect(url).to.contain("services/blogpost/12/comment");
            expect(model).to.eql({ da : "ta"});
            callback();
        };

        RemoteService.__set__("request", requestMock);

        var serviceAdapter = new RemoteService("blogpost/comment");

        serviceAdapter.update(true, {blogpost : 12 }, model, function (response) {
            done();
        });
    });
});