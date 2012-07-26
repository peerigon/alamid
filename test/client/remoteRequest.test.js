"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    rewire = require("rewire");

describe("remoteRequest", function () {
    describe("request", function() {

        var remoteRequest;

        beforeEach(function(){
            remoteRequest = rewire("../../lib/client/remoteRequest.js", false);
        });

        describe("HTTP-Transport", function() {
            it("should pass all data to the http-transport", function(done) {

                var httpRequestMock = function(method, url, modelData, callback) {
                    expect(method).to.be("post");
                    expect(url).to.be("services/blog");
                    expect(modelData).to.eql({ da : "ta" });
                    expect(callback).to.be.a("function");
                    callback();
                };

                remoteRequest.__set__("httpRequest", httpRequestMock);
                remoteRequest.request("create", "services/blog", { da : "ta" }, function(response){
                    done();
                });
            });
        });

        describe("Websocket-Transport", function() {
            it("should pass all data to the websocket-transport", function(done) {

                var configMock = {
                    useWebsockets : true
                };

                var socketMock ={
                    emit : function(method, url, model, callback) {
                        expect(method).to.be("create");
                        expect(url).to.contain("services/blog");
                        expect(model).to.eql({ da : "ta" });
                        expect(callback).to.be.a("function");
                        callback();
                    }
                };

                var httpRequestMock = function(method, url, modelData, callback) {
                    done(new Error("HTTP should not be called"));
                };

                remoteRequest.__set__("httpRequest", httpRequestMock);
                remoteRequest.__set__("config", configMock);
                //overwrite predefined mock!
                remoteRequest.__set__("socket", socketMock);

                remoteRequest.request("create", "services/blog", { da : "ta" }, function(response){
                    done();
                });
            });
        });
    });

    describe("remoteService", function() {

        var model = {
            getUrl : function() {
                return "blogpost";
            },
            getParentIds : function() {
                return null;
            },
            toJSON : function() {
                return JSON.stringify({ da : "ta "});
            },
            get : function() {
                return { da : "ta"};
            }
        };

        var remoteRequest = require("../../lib/client/remoteRequest.js");

        it("should return a valid remoteService", function() {
            var serviceAdapter = new remoteRequest.RemoteService("blogpost");
            expect(serviceAdapter.read).to.be.a("function");
            expect(serviceAdapter.create).to.be.a("function");
            expect(serviceAdapter.update).to.be.a("function");
            expect(serviceAdapter.delete).to.be.a("function");
        });

        it("should pass the right data to the dom-adapter request", function(done) {
            var requestMock = function(method, url, model, callback) {
                expect(method.toLowerCase()).to.be("create");
                expect(url).to.contain("services/blogpost");
                expect(model).to.eql({ da : "ta"} );
                callback();
            };

            var remoteRequest = rewire("../../lib/client/remoteRequest.js", false);
            remoteRequest.__set__("request",requestMock);
            var serviceAdapter = new remoteRequest.RemoteService("blogpost");

            serviceAdapter.create(model, function(response) {
                done();
            });
        });

        it("should resolve the URL with parentIDs for the request", function(done) {
            var requestMock = function(method, url, model, callback) {
                expect(method.toLowerCase()).to.be("update");
                expect(url).to.contain("services/blogpost/12/comment");
                expect(model).to.eql({ da : "ta"} );
                callback();
            };

            model.getParentIds = function() {
                return {
                    blogpost : 12
                };
            };

            model.getUrl = function() {
                return "blogpost/comment";
            };

            var remoteRequest = rewire("../../lib/client/remoteRequest.js", false);
            remoteRequest.__set__("request",requestMock);
            var serviceAdapter = new remoteRequest.RemoteService("blogpost");

            serviceAdapter.update(model, function(response) {
                done();
            });
        });
    });
});