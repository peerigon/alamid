"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class,
    Socket = require("./mocks/Socket.class.js");

var expect = require("expect.js"),
    rewire = require("rewire");

describe("attachPushHandlers", function(){

    var socketMock,
        attachPushHandlers;

    beforeEach(function() {
        socketMock = new Socket();
        attachPushHandlers = rewire("../../lib/client/attachPushHandlers.js");
    });

    it("should receive remoteUpdateEvents", function(done) {

        var modelMock = {
            emit : function(eventName, event) {
                expect(eventName).to.be("remoteUpdate");
                expect(event.preventDefault).to.be.a("function");
            },
            set : function(data) {
                expect(data).to.eql({ da : "ta" });
                done();
            }
        };

        var modelCacheMock = {
            get : function(modelUrl, modelId) {
                expect(modelUrl).to.be("blogpost");
                expect(modelId).to.eql(1);
                return modelMock;
            }
        };

        attachPushHandlers.__set__("modelCache", modelCacheMock);
        attachPushHandlers(socketMock);

        socketMock.emit("remoteUpdate", "blogpost", { blogpost : 1 }, { da : "ta" });
    });

    it("should receive remoteDeleteEvents", function(done) {

        var modelMock = {
            emit : function(eventName, event) {
                expect(eventName).to.be("remoteDelete");
                expect(event.preventDefault).to.be.a("function");
            },
            removeAll : function() {
                done();
            }
        };

        var modelCacheMock = {
            get : function(modelUrl, modelId) {
                expect(modelUrl).to.be("blogpost");
                expect(modelId).to.eql(2);
                return modelMock;
            }
        };

        //var modelCacheMock = getModelCacheMock(modelMock, onModelLoad);
        attachPushHandlers.__set__("modelCache", modelCacheMock);
        attachPushHandlers(socketMock);

        socketMock.emit("remoteDelete", "blogpost", { blogpost : 2 }, { da : "ta" });
    });

    it("should receive remoteCreateEvents", function(done) {

        function ModelMock(id) {
            return {
                id : id,
                set : function(data) {
                    expect(data).to.eql({ da : "ta" });
                }
            };
        }

        var modelRegistryMock = {
            getModel : function(modelUrl) {
                expect(modelUrl).to.be("blogpost");
                return ModelMock;
            }
        };

        var modelCacheMock = {
            add : function(addModel) {
                expect(addModel.id).to.be(3);
                done();
            }
        };

        attachPushHandlers.__set__("modelCache", modelCacheMock);
        attachPushHandlers.__set__("modelRegistry", modelRegistryMock);
        attachPushHandlers(socketMock);

        socketMock.emit("remoteCreate", "blogpost", { blogpost : 3 }, { da : "ta" });
    });

    it("should not call the following function on preventDefault remoteDeleteEvents", function(done) {

        var modelMock = {
            emit : function(eventName, updateEvent) {
                expect(eventName).to.be("remoteDelete");
                updateEvent.preventDefault();
                setTimeout(function() {
                    done();
                }, 100);
            },
            removeAll : function() {
                done(new Error("RemoveAll should not be after preventDefault was called"));
            }
        };

        var modelCacheMock = {
            get : function(modelUrl, modelId) {
                expect(modelUrl).to.be("blogpost");
                expect(modelId).to.eql(2);
                return modelMock;
            }
        };

        attachPushHandlers.__set__("modelCache", modelCacheMock);
        attachPushHandlers(socketMock);

        socketMock.emit("remoteDelete", "blogpost", { blogpost : 2 }, { da : "ta" });
    });
});