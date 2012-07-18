"use strict";

var path = require("path"),
    exec = require('child_process').exec,
    expect = require("expect.js"),
    http = require("http"),
    Browser = require("zombie");

var runTestServer = require("../setup/runTestServer.js");

require("nodeclass").registerExtension();
//compile classes if found
describe("WebsocketTransport", function() {

    var serverInstance;

    before(function(done) {
        runTestServer({
            "appDir" : path.resolve(__dirname, "../setup/testApp")
        }, function(srvInstance) {
            serverInstance = srvInstance;
            done();
        });
    });

    describe("#Basic Requesting", function() {
        before(function(done) {
            this.browser = new Browser();
            this.browser
                .visit("http://localhost:9090/statics/websockettest.html")
                .then(done, done);
        });

        it("should load the promises page", function() {
            expect(this.browser.location.pathname).to.eql("/statics/websockettest.html");
        });
    });

    describe("#Websocket Requesting", function() {
        before(function(done) {
            this.browser = new Browser();
            this.browser
                .visit("http://localhost:9090/statics/websockettest.html")
                .then(done, done);
        });

        it("should return an not defined error for a service request", function(done) {
            var pommes = this.browser.evaluate("wsRequestTest('read', '/services/whatever', {});");
            pommes.success = function(res) {
                expect(JSON.stringify(res)).to.contain('{"status":"error","message":"(alamid) Request failed for path \'whatever\' with Error: \'No service found for \'read\'');
                done();
            };
        });

        it("should return an not defined error for a validator request", function(done) {
            var pommes = this.browser.evaluate("wsRequestTest('read', '/validators/whatever', {});");
            pommes.success = function(res) {
                expect(JSON.stringify(res)).to.contain('{"status":"error","message":"(alamid) Request failed for path \'whatever\' with Error: \'No validator found for Model ');
                done();
            };
        });
    });

    after(function() {
        serverInstance.kill("SIGHUP");
    });
});


