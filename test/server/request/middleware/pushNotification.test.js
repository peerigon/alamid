"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path");

var Request = require("../../../../lib/server/request/Request.class.js"),
    Response = require("../../../../lib/server/request/Response.class.js"),
    pushNotification = require("../../../../lib/server/request/middleware/pushNotification.js");

function getSocketMock(callback) {
    return {
        broadcast : {
            to : function(roomName) {
                return {
                    emit : function(eventName, path, ids, data) {
                        callback(eventName, path, ids, data, roomName);
                    }
                };
            }
        }
    };
}

describe("pushNotification", function(){

    var req, res;

    beforeEach(function() {
        req = new Request("update", "/services/blogpost/1", { da : "ta" });
        res = new Response();
        res.setData({ da : "ta" });
    });

    describe("Transport Support", function() {
        it("should do nothing for transports other than websockets", function(done) {

            function onBroadcast() {
                done(new Error("Should not be called for HTTP"));
            }

            req.setOriginatedRequest("http", getSocketMock(onBroadcast));

            pushNotification(req, res, function() {
                done();
            });
        });
    });

    describe("Room-Handling", function() {
        it("should emit to the global room '' on default", function(done) {

            function onBroadcast(eventName, path, ids, data, room) {
                expect(eventName).to.be("remoteUpdate");
                expect(path).to.be("blogpost");
                expect(ids).to.eql({ "blogpost" : 1 });
                expect(data).to.eql({ da : "ta" });

                //room check
                expect(room).to.be("");
            }

            req.setOriginatedRequest("websocket", getSocketMock(onBroadcast));

            pushNotification(req, res, function() {
                done();
            });
        });

        it("should use the activeRoomID as room if ist was set via session before", function(done) {

            function onBroadcast(eventName, path, ids, data, room) {
                expect(eventName).to.be("remoteUpdate");
                expect(path).to.be("blogpost");
                expect(ids).to.eql({ "blogpost" : 1 });
                expect(data).to.eql({ da : "ta" });

                //room check
                expect(room).to.be("awesomeRoom");
            }

            req.setSession({ activeRoomID : "awesomeRoom" });
            req.setOriginatedRequest("websocket", getSocketMock(onBroadcast));

            pushNotification(req, res, function() {
                done();
            });
        });


    });

    describe("CRUD-methods", function() {
        it("should emit a broadcast for update", function(done) {

            function onBroadcast(eventName, path, ids, data) {
                expect(eventName).to.be("remoteUpdate");
                expect(path).to.be("blogpost");
                expect(ids).to.eql({ "blogpost" : 1 });
                expect(data).to.eql({ da : "ta" });
            }

            req.setOriginatedRequest("websocket", getSocketMock(onBroadcast));

            pushNotification(req, res, function() {
                done();
            });
        });

        it("should emit a broadcast for create", function(done) {
            function onBroadcast(eventName, path, ids, data) {
                expect(eventName).to.be("remoteCreate");
                expect(path).to.be("blogpost");
                expect(ids).to.eql({ "blogpost" : 1 });
                expect(data).to.eql({ da : "ta" });
            }

            req.setMethod("create");
            req.setOriginatedRequest("websocket", getSocketMock(onBroadcast));

            pushNotification(req, res, function() {
                done();
            });
        });

        it("should emit a broadcast for delete", function(done) {
            function onBroadcast(eventName, path, ids, data) {
                expect(eventName).to.be("remoteDelete");
                expect(path).to.be("blogpost");
                expect(ids).to.eql({ "blogpost" : 1 });
                expect(data).to.be(undefined);
            }

            req.setMethod("delete");
            req.setOriginatedRequest("websocket", getSocketMock(onBroadcast));
            res.setData({ da : "ta" });

            pushNotification(req, res, function() {
                done();
            });
        });
    });
});