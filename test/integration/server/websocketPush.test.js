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


    describe("#Websocket Requesting", function() {
        before(function(done) {
            this.browser = new Browser();
            this.browser
                .visit("http://localhost:9090/statics/pushtest.html")
                .then(done, done);
        });

        it("should send push requests to other browser-instances", function(done) {

            var self = this;

            var secondBrowser = new Browser({ debug : true })
                .visit("http://localhost:9090/statics/pushtest.html")
                .then(checkPush, function(err) {
                    console.log("err", err);
                    done(err);
                });

            function checkPush() {
                console.log("check PUSH called");
                var pushPommes = secondBrowser.evaluate("wsPushHandler()");
                pushPommes.success = function(url, id, data) {
                    console.log("PUSHED!");
                    //expect(JSON.stringify(res)).to.contain('{"status":"error","message":"(alamid) Request failed for path \'whatever\' with Error: \'No service found for \'read\'');
                    done();
                };

                var reqPommes = self.browser.evaluate("wsRequestTest('update', 'services/push/1', {});");
                reqPommes.success = function(res) {
                    console.log("RESRESRESR", res);
                    expect(res.status).to.be("success");
                    //done();
                };

            }
        });
    });

    after(function() {
        serverInstance.kill("SIGHUP");
    });
});
