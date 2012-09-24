"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    rewire = require("rewire");

describe("request", function () {
    describe("request", function() {

        var remoteRequest;

        beforeEach(function(){
            remoteRequest = rewire("../../lib/client/request.js");
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
                remoteRequest("create", "services/blog", { da : "ta" }, function(response){
                    done();
                });
            });
        });

        describe("Websocket-Transport", function() {
            it("should pass all data to the websocket-transport", function(done) {

                var configMock = {
                    useWebsockets : true
                };

                var appMock = {
                    getSocket : function() {
                        return socketMock;
                    }
                };

                var socketMock ={
                    emit : function(method, url, model, callback) {
                        expect(method).to.be("create");
                        expect(url).to.contain("services/blog");
                        expect(model).to.eql({ da : "ta" });
                        expect(callback).to.be.a("function");
                        callback();
                    },
                    socket : {
                        connected : true
                    }
                };

                var httpRequestMock = function(method, url, modelData, callback) {
                    done(new Error("HTTP should not be called"));
                };

                remoteRequest.__set__("httpRequest", httpRequestMock);
                remoteRequest.__set__("config", configMock);
                //overwrite predefined mock!
                remoteRequest.__set__("app", appMock);

                remoteRequest("create", "services/blog", { da : "ta" }, function(response){
                    done();
                });
            });
        });
    });
});