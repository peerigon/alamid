"use strict";

var path = require("path"),
    exec = require('child_process').exec,
    expect = require("expect.js"),
    http = require("http");

var runTestServer = require("../setup/runTestServer.js");

require("nodeclass").registerExtension();

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

describe("handleHttp", function() {
    describe("#Basic Requesting", function() {

        var serverInstance;

        before(function(done) {
            runTestServer({
                "appDir" : path.resolve(__dirname, "../setup/testApp")
            }, function(srvInstance) {
                serverInstance = srvInstance;
                console.log("before done");
                done();
            });
        });

        describe("##Page-Handling", function(){

            it("should return the index-page on '/' request", function (done) {
                this.timeout(100000);
                httpRequest("/", function(data) {
                    expect(data).to.contain("<!-- index.html -->");
                    done();
                });
            });

            it("should deliver the index-page on a different init-page request", function (done) {
                this.timeout(100000);
                httpRequest("/blog", function(data) {
                    expect(data).to.contain("<!-- index.html -->");
                    done();
                });
            });

            it("should return 'not found' if a non existent page was requested", function (done) {
                this.timeout(100000);
                httpRequest("/nonExistentPage", function(data) {
                    expect(data).to.contain("Not found");
                    done();
                });
            });
        });

        describe("## /pages/ Request-Handling", function() {

            it("should return the page-javascript if page exists", function (done) {
                this.timeout(100000);
                httpRequest("/pages/blog.js", function(data) {
                    expect(data).to.contain("blog.js");
                    done();
                });
            });

            it("should return not-found if page-javascript does not exist", function (done) {
                this.timeout(100000);
                httpRequest("/pages/notThere.js", function(data) {
                    expect(data).to.contain("Not found");
                    done();
                });
            });
        });

        describe("## /bootstrap.js", function(){
            it("should return the bootstrap-file", function (done) {
                this.timeout(100000);
                httpRequest("/bootstrap.js", function(data) {
                    expect(data).to.contain("//bootstrap");
                    done();
                });
            });
        });

        describe("#onServiceRequest", function(){
            it("should hand the request on to the service-route", function (done) {
                this.timeout(100000);
                httpRequest("/services/myNonExistentService/", function(data) {
                    expect(data).to.contain("(alamid) No service found for");
                    expect(data).to.contain('{"status":"error"');
                    done();
                });
            });
        });

        describe("#onValidatorRequest", function(){
            it("should hand the request on to the validator-route", function (done) {
                this.timeout(100000);
                httpRequest("/validators/myNonExistentValidator/", function(data) {
                    expect(data).to.contain("No validator found for");
                    expect(data).to.contain('{"status":"error"');
                    done();
                });
            });
        });

        after(function() {
            serverInstance.kill("SIGHUP");
        });
    });

});


