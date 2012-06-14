"use strict"; // run code in ES5 strict mode

require("./testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    rewire = require("rewire");

var Request = require("../compiled/server/request/Request.class.js"),
    Response = require("../compiled/server/request/Response.class.js"),
    runService = rewire("../compiled/server/request/middleware/runService.js");


describe("runService", function(){

    var servicesMock = {
        getService : function(path) {

            if(path === "services/test/test.server.js"){
                return {
                    "POST" : function(data, callback){ callback(200); },
                    "PUT" : function(data, callback){ callback(200); },
                    "GET" : function(data, callback){ callback(200, { "da" : "ta" }); }
                }
            }

            if(path === "services/test2/test2.server.js"){
                return {}
            }
            return null;
        }
    };
    runService.__set__("services", servicesMock);
    runService.__set__("paths", {
        compiledPath : __dirname + "/exampleApp/app"
    });

    it("should find the mocked POST service, run it and next afterwards", function (done) {

        var method = "POST",
            path = "/services/test/",
            data = { "da" : "ta" };

        var request = new Request(method, path, data),
            response = new Response();

        runService(request, response, function(err) {
            expect(response.getStatusCode()).to.be(200);
            done();
        });
    });


    it("should find the mocked GET service, run it and next afterwards with data attached to response", function (done) {

        var method = "GET",
            path = "/services/test",
            data = { "da" : "ta" };

        var request = new Request(method, path, data),
            response = new Response();

        runService(request, response, function(err) {
            expect(response.getStatusCode()).to.be(200);
            expect(response.getData()).to.eql('{"da":"ta"}');
            done();
        });
    });

    it("should next with an error code if the service for the given method is not allowed", function (done) {

        var method = "DELETE",
            path = "/services/test",
            data = { "da" : "ta" };

        var request = new Request(method, path, data),
            response = new Response();

        runService(request, response, function(err) {
            expect(response.getStatusCode()).to.be(405);
            done();
        });
    });

    it("should next with an error code if no service is registered for given path", function (done) {

        var method = "DELETE",
            path = "/services/test2",
            data = { "da" : "ta" };

        var request = new Request(method, path, data),
            response = new Response();

        runService(request, response, function(err) {
            expect(response.getStatusCode()).to.be(403);
            done();
        });
    });
});