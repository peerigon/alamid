"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class,
    Socket = require("./mocks/Socket.class.js");

var expect = require("expect.js"),
    rewire = require("rewire");

describe("subscribeModelHandler", function(){

    var socketMock,
        attachPushHandlers;

    beforeEach(function() {
        socketMock = new Socket();
        attachPushHandlers = rewire("../../lib/client/subscribeModelHandler.js");
    });

    it("should receive remoteUpdateEvents", function(done) {

        var modelInstanceMock = {
            setParentIds : function(ids) {
                expect(ids).to.eql({ blogpost : 1 });
            }
        };

        var ModelClassMock = {
            set : function() {

            },
            emit : function(eventName, event) {
                expect(eventName).to.be("remoteUpdate");
                expect(event.parentIds).to.eql({ blogpost : 1 });
                expect(event.data).to.eql({ da : "ta" });
                done();
            }
        };

        var modelCacheMock = {
            get : function(modelUrl, modelId) {
                expect(modelUrl).to.be("blogpost");
                expect(modelId).to.eql(1);
                return modelInstanceMock;
            }
        };

        var modelRegistryMock = {
            getModel : function(modelUrl) {
                expect(modelUrl).to.eql("blogpost");
                return ModelClassMock;
            }
        };

        attachPushHandlers.__set__("modelCache", modelCacheMock);
        attachPushHandlers.__set__("modelRegistry", modelRegistryMock);
        attachPushHandlers(socketMock);

        socketMock.emit("remoteUpdate", "blogpost", { blogpost : 1 }, { da : "ta" });
    });


    it("should receive remoteDestroyEvents", function(done) {

        var modelInstanceMock = {};

        var ModelClassMock = {
            emit : function(eventName, event) {
                expect(eventName).to.be("remoteDestroy");
                expect(event.model).to.be(modelInstanceMock);
                done();
            }
        };

        var modelCacheMock = {
            get : function(modelUrl, modelId) {
                expect(modelUrl).to.be("blogpost");
                expect(modelId).to.eql(2);
                return modelInstanceMock;
            }
        };

        var modelRegistryMock = {
            getModel : function(modelUrl) {
                expect(modelUrl).to.eql("blogpost");
                return ModelClassMock;
            }
        };

        attachPushHandlers.__set__("modelCache", modelCacheMock);
        attachPushHandlers.__set__("modelRegistry", modelRegistryMock);

        attachPushHandlers.__set__("modelCache", modelCacheMock);
        attachPushHandlers(socketMock);

        socketMock.emit("remoteDestroy", "blogpost", { blogpost : 2 });
    });


    it("should receive remoteCreateEvents", function(done) {

        var ModelClassMock = function(id) {
            this.id = "";
            var self = this;

            this.set = function(data) {
                expect(data).to.eql({ da : "ta" });
            };

            this.setParentIds = function(parentIds) {
                expect(parentIds).to.eql({ blogpost : 3 });
            };

            (function init(id) {
                self.id = id;
            })(id);
        };

        ModelClassMock.emit = function(eventName, event) {
            expect(eventName).to.be("remoteCreate");
            expect(event.model.id).to.be(3);
            done();
        };

        var modelRegistryMock = {
            getModel : function(modelUrl) {
                expect(modelUrl).to.be("blogpost");
                return ModelClassMock;
            }
        };

        var modelCacheMock = {
            add : function(addModel) {
                expect(addModel.id).to.be(3);
            }
        };

        attachPushHandlers.__set__("modelCache", modelCacheMock);
        attachPushHandlers.__set__("modelRegistry", modelRegistryMock);
        attachPushHandlers(socketMock);

        socketMock.emit("remoteCreate", "blogpost", { blogpost : 3 }, { da : "ta" });
    });
});