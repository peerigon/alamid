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

function runTestServer(configEnv) {

    var cmd = "node " + path.resolve(__dirname, "../../handleHttp/runServer.js");
    console.log("cmd", cmd);

    var testSrv = exec(cmd, { "env" : configEnv },
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });

    return testSrv;
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

        describe("onRequest", function(){
            it("should return an error message if the page was not found", function (done) {

                var serverInstance = runTestServer({
                           "appDir" : path.resolve(__dirname, "../../handleHttp/app")
                       });

                console.log("serverInstance", serverInstance);

                serverInstance.stdout.on("data", function(msg) {
                    console.log("stdout: ", msg);
                });

                serverInstance.on("error", function(err) {
                    console.log("err", err);
                });

                this.timeout(100000);

                ///*
                http.get({host:'localhost', port:9090, path:'/'}, function (res) {
                  // Do stuff
                    console.log(res);
                });
                //*/

                //httpRequest("/", function(data) {
                //expect(data).to.contain("Page not found.");
                //console.log("data");
                //done();
                //serverInstance.kill();
                //});

            });
        });


        /*
         describe("onStaticRequest", function(){
         it("should return error-message if file was not found", function (done) {
         this.timeout(100000);
         httpRequest("/statics/test.txt", function(data) {
         expect(data).to.contain("Not found.");
         done();
         });
         });
         });

         describe("#onServiceRequest", function(){
         it("should return error-message if service was not found", function (done) {
         this.timeout(100000);
         httpRequest("/services/myNonExistentService/", function(data) {
         if(config.isDev) {
         expect(data).to.contain("No service found for: services/myNonExistentService");
         }
         else{
         expect(data).to.contain("Internal Server Error");
         }

         done();
         });
         });

         it("should return error-message if service was not found", function (done) {
         this.timeout(100000);
         httpRequest("/services/myNonExistentService/", function(data) {
         if(config.isDev) {
         expect(data).to.contain("No service found for: services/myNonExistentService");
         }
         else{
         expect(data).to.contain("Internal Server Error");
         }

         done();
         });
         });
         });

         after(function() {
         //serverInstance.kill("SIGHUP");
         });
         */

    });
});


