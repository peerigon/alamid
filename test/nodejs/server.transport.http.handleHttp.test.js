"use strict";

require("./testHelpers/compileTestAlamid.js");

var config = require("../../lib/shared/config");

var connect = require("connect"),
    expect = require("expect.js"),
    rewire = require("rewire"),
    http = require("http"),
    path = require("path");

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

    var handleHttp,
        server;

    before(function(){
        handleHttp = require("../../compiled/server/transport/http/handleHttp.js");

        server = connect();
        //give connect some middlewares for the routes
        handleHttp.init(server);
        server.listen(9090);
    });

    describe("onRequest", function(){

        it("should return an error message if the page was not found", function (done) {
            this.timeout(100000);
            httpRequest("/", function(data) {
                expect(data).to.contain("Page not found.");
                done();
            });
        });
    });


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

});
