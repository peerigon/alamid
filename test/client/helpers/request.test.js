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
});