"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    rewire = require("rewire");

var remoteRequest = require("../../lib/client/remoteRequest.js");

describe("remoteRequest", function () {

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
                return { da : "ta "};
            }
        };

        it("should return a valid remoteService", function() {
            var serviceAdapter = new remoteRequest.RemoteService("blogpost");

            expect(serviceAdapter.read).to.be.a("function");
            expect(serviceAdapter.create).to.be.a("function");
            expect(serviceAdapter.update).to.be.a("function");
            expect(serviceAdapter.delete).to.be.a("function");
        });

        it("should pass the right data to the dom-adapter request", function() {

            var requestMock = function(method, url, model, callback) {

            };


           // var remoteRequest = rewire("../../lib/client/remoteRequest.js", false);

            //remoteRequest.__set__("request", requestMock);


        });
    });
});