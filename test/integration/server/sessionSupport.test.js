"use strict";

var path = require("path"),
    exec = require('child_process').exec,
    expect = require("expect.js"),
    http = require("http"),
    Browser = require("zombie");

require("nodeclass").registerExtension();
//compile classes if found

var runTestServer = require("../setup/runTestServer.js");

function httpRequest(reqPath, callback) {
    http.get({host:'localhost', port:9090, path: reqPath, agent:false}, function (res) {
        // Do stuff
        var data = "";

        res.on('data', function (chunk) {
            data+=chunk;
        });

        res.on("end", function() {
            callback(data);
        });
    });
}

describe("Session Support", function() {

    describe("#Websockets", function() {

        var browser,
            serverInstance;

        before(function(done) {

            browser = new Browser();

            runTestServer({
                "appDir" : path.resolve(__dirname, "../setup/testApp")
            }, function(srvInstance) {
                serverInstance = srvInstance;
                browser
                    .visit("http://localhost:9090/statics/websockettest.html")
                    .then(done, done);
            });
        });

        it("should incremented the sessionCount for http-requests", function(done) {

            //first request
            var pommes = browser.evaluate("wsRequestTest('read', '/services/session', {});");
            pommes.success = function(res) {
                expect(JSON.stringify(res)).to.contain('{"status":"success","data":{"sessionCount":1}}');

                //second request
                var pommes2 = browser.evaluate("wsRequestTest('read', '/services/session', {});");
                pommes2.success = function(res) {
                    expect(JSON.stringify(res)).to.contain('{"status":"success","data":{"sessionCount":2}}');
                    done();
                };
            };
        });

        after(function() {
            serverInstance.kill("SIGHUP");
        });
    });

    describe("#HTTP Requests", function() {

        var serverInstance,
            browser = new Browser();

        before(function(done) {
            runTestServer({
                "appDir" : path.resolve(__dirname, "../setup/testApp")
            }, function(srvInstance) {
                serverInstance = srvInstance;
                browser
                    .visit("http://localhost:9090/statics/websockettest.html")
                    .then(done, done);
            });
        });

        it("should return always the same sessionCount for requests without session support", function(done) {
            httpRequest("/services/session", function(res) {
                expect(res).to.contain('{"status":"success","data":{"sessionCount":1}}');
                httpRequest("/services/session", function(res) {
                    expect(res).to.contain('{"status":"success","data":{"sessionCount":1}}');
                    done();
                });
            });
        });

        it("should incremented the sessionCounter for http-requests", function(done) {
            browser.visit("http://localhost:9090/services/session", function(e, browser) {
                expect(browser.html()).to.contain('{"status":"success","data":{"sessionCount":1}}');
                browser.visit("http://localhost:9090/services/session", function(e, browser) {
                    expect(browser.html()).to.contain('{"status":"success","data":{"sessionCount":2}}');
                    done();
                });
            });
        });

        after(function() {
            serverInstance.kill("SIGHUP");
        });
    });

    describe("#Cross-Tranport-Sessions (HTTP & Websockets)", function() {

        var browser,
            serverInstance;

        before(function(done) {
            browser = new Browser();
            //http & websocket server
            runTestServer({
                "appDir" : path.resolve(__dirname, "../setup/testApp")
            }, function(srvInstance) {
                serverInstance = srvInstance;
                browser
                    .visit("http://localhost:9090/statics/websockettest.html")
                    .then(done, done);
            });
        });

        it("should increment the session-counter on mixed service requests (Websocket first)", function(done) {
            //first request
            var pommes = browser.evaluate("wsRequestTest('read', '/services/session', {});");
            pommes.success = function(res) {
                expect(JSON.stringify(res)).to.contain('{"status":"success","data":{"sessionCount":1}}');
                browser.visit("http://localhost:9090/services/session", function(e, browser) {
                    expect(browser.html()).to.contain('{"status":"success","data":{"sessionCount":2}}');
                    done();
                });
            };
        });

        it("should increment the session-counter on mixed service requests (HTTP first)", function(done) {
            //first request
            browser.visit("http://localhost:9090/services/session", function(e, browser) {
                expect(browser.html()).to.contain('{"status":"success","data":{"sessionCount":3}}');
                var pommes = browser.evaluate("wsRequestTest('read', '/services/session', {});");
                pommes.success = function(res) {
                    expect(JSON.stringify(res)).to.contain('{"status":"success","data":{"sessionCount":4}}');
                    done();
                };
            });
        });

        after(function() {
            serverInstance.kill("SIGHUP");
        });
    });
});


