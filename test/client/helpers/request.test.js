"use strict";

var expect = require("expect.js"),
    value = require("value"),
    rewire = require("rewire");

describe("request", function () {
    var request;

    beforeEach(function(){
        request = rewire("../../../lib/client/helpers/request.js");
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

            request.__set__("httpRequest", httpRequestMock);
            request("create", "services/blog", { da : "ta" }, function (response) {
                done();
            });
        });
    });

    describe("Websocket-Transport", function () {
        it("should pass all data to the websocket-transport", function(done) {

            var configMock = {
                    use : {
                        websockets : true
                    }
                },
                socketMock ={
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
                },
                httpRequestMock = function(method, url, modelData, callback) {
                    done(new Error("HTTP should not be called"));
                };

            request.__set__("httpRequest", httpRequestMock);
            request.__set__("config", configMock);
            request.socket = socketMock;

            request("create", "services/blog", { da : "ta" }, function (response) {
                done();
            });
        });
    });

    describe("read-request debounce", function() {

        describe("http", function() {

            it("should only send one single request if multiple identical requests are triggered while the first request is active", function(done) {

                var emitCallCount = 0,
                    firstCallbackResponse = null;

                var configMock = {
                    use : {
                        websockets : false
                    }
                };

                var httpRequestMock = function(method, url, modelData, callback) {

                    emitCallCount++;

                    expect(method).to.be("get");
                    expect(url).to.contain("services/blog");
                    expect(modelData).to.eql({ da : "ta" });
                    expect(callback).to.be.a("function");

                    setTimeout(callback, 10);
                };

                request.__set__("httpRequest", httpRequestMock);
                request.__set__("config", configMock);

                request("read", "services/blog", { da : "ta" }, function (response) {
                    firstCallbackResponse = response;
                });

                request("read", "services/blog", { da : "ta" }, function (response) {
                    expect(emitCallCount).to.eql(1);
                    expect(response).to.eql(firstCallbackResponse);
                    done();
                });
            });
        });

        describe("websockets", function() {

            it("should only send a single request if multiple identical requests are triggered while the first request is active", function(done) {

                var emitCallCount = 0,
                    firstCallbackResponse = null;

                var configMock = {
                        use : {
                            websockets : true
                        }
                    },
                    socketMock ={
                        emit : function(method, url, model, callback) {

                            emitCallCount++;

                            expect(method).to.be("read");
                            expect(url).to.contain("services/blog");
                            expect(model).to.eql({ da : "ta" });
                            expect(callback).to.be.a("function");

                            setTimeout(callback, 10);
                        },
                        socket : {
                            connected : true
                        }
                    },
                    httpRequestMock = function() {
                        done(new Error("HTTP should not be called"));
                    };

                request.__set__("httpRequest", httpRequestMock);
                request.__set__("config", configMock);
                request.socket = socketMock;

                request("read", "services/blog", { da : "ta" }, function (response) {
                    firstCallbackResponse = response;
                });

                request("read", "services/blog", { da : "ta" }, function (response) {
                    expect(emitCallCount).to.eql(1);
                    expect(response).to.eql(firstCallbackResponse);
                    done();
                });
            });

            it("should not debounce on other method than read", function(done) {

                var emitCallCount = 0,
                    firstCallbackResponse = false;

                var configMock = {
                        use : {
                            websockets : true
                        }
                    },
                    socketMock ={
                        emit : function(method, url, model, callback) {

                            emitCallCount++;

                            expect(method).to.be("create");
                            expect(url).to.contain("services/blog");
                            expect(model).to.eql({ da : "ta" });
                            expect(callback).to.be.a("function");

                            setTimeout(callback, 10);
                        },
                        socket : {
                            connected : true
                        }
                    },
                    httpRequestMock = function() {
                        done(new Error("HTTP should not be called"));
                    };

                request.__set__("httpRequest", httpRequestMock);
                request.__set__("config", configMock);
                request.socket = socketMock;

                request("create", "services/blog", { da : "ta" }, function (response) {
                    firstCallbackResponse = response;
                });

                request("create", "services/blog", { da : "ta" }, function (response) {
                    expect(emitCallCount).to.eql(2);
                    done();
                });
            });
        });
    });
});