"use strict";

var util = require('util'),
    path = require("path"),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    connect = require("connect"),
    expect = require("expect.js"),
    rewire = require("rewire"),
    http = require("http");

require("../../../testHelpers/compileTestAlamid.js");

function runTestServer(configEnv, callback) {

    var cmd = "node " + path.resolve(__dirname, "../../handleHttp/runServer.js"),
        testSrv;

    testSrv = exec(cmd, { "env" : configEnv },
        function (error) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });

    testSrv.stdout.on("data", function(data) {

        console.log(data);

        if(data.indexOf("TEST-SERVER listening on 9090") !== -1){
            callback(testSrv);
        }
    });
}

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
                "appDir" : path.resolve(__dirname, "../../handleHttp/app")
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
                    expect(data).to.contain("Error: No service found for");
                    expect(data).to.contain('{"status":"error"');
                    done();
                });
            });

            it("should return an error-message if service was not found", function (done) {
                this.timeout(100000);
                httpRequest("/services/myNonExistentService/", function(data) {
                    done();
                });
            });
        });

        describe("#onValidatorRequest", function(){
            //TBD!
        });

        after(function() {
            serverInstance.kill("SIGHUP");
        });
    });

});


