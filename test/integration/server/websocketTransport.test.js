"use strict";

var path = require("path"),
    exec = require('child_process').exec,
    expect = require("expect.js"),
    http = require("http"),
    Browser = require("zombie");

var createFakePackageJSON = require("../helpers/createFakePackageJSON.js"),
    removeFakePackageJSON = require("../helpers/removeFakePackageJSON.js");

var runTestServer = require("../setup/runTestServer.js");

//compile classes if found
describe("WebsocketTransport", function() {

    var serverInstance;

    before(function(done) {
        createFakePackageJSON(function() {
            runTestServer({
                "appDir" : path.resolve(__dirname, "../setup/testApp")
            }, function(srvInstance) {
                serverInstance = srvInstance;
                done();
            });
        });
    });

    after(function(done) {
        removeFakePackageJSON(done);
    });

    describe("#Basic Requesting", function() {
        before(function(done) {
            this.browser = new Browser();
            this.browser
                .visit("http://localhost:9000/statics/websockettest.html")
                .then(done, function(err) {
                    console.log("err", err);
                });
        });

        it("should load the promises page", function() {
            expect(this.browser.location.pathname).to.eql("/statics/websockettest.html");
        });
    });


    describe("#Websocket Requesting", function() {
        before(function(done) {
            this.browser = new Browser();
            this.browser
                .visit("http://localhost:9000/statics/websockettest.html")
                .then(done, done);
        });

        it("should return an not defined error for a service request", function(done) {
            var self = this;
            var pommes = self.browser.evaluate("wsRequestTest('read', '/services/whatever', {});");
            pommes.success = function(res) {
                expect(JSON.stringify(res)).to.contain('{"status":"error","message":"(alamid) Request failed for path \'whatever\' with Error: \'No service found for \'read\'');
                done();
            };
        });


        it("should return an not defined error for a validator request", function(done) {
            var pommes = this.browser.evaluate("wsRequestTest('read', '/validators/whatever', {});");
            pommes.success = function(res) {
                expect(JSON.stringify(res)).to.contain('{"status":"error","message":"(alamid) Request failed for path \'whatever\' with Error: ');
                done();
            };
        });

    });

    after(function() {
        serverInstance.kill("SIGHUP");
    });
});
