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

            if(path === __dirname + "/exampleApp/app/services/test/test.server.js"){
                return {
                    "POST" : function(data, callback){ callback(200); },
                    "PUT" : function(data, callback){ callback(200); },
                    "GET" : function(data, callback){ callback(200, { "da" : "ta" }); },
                    "DELETE" : function(data, callback){ callback(200);  }
                }
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
            path = "/services/test",
            data = { "da" : "ta" };

        var request = new Request(method, path, data),
            response = new Response();

        runService(request, response, function(err) {

            console.log("ERR", err);
            console.log("REQUEST:",request, "RESPONSE", response);
            console.log("statusCode:", response.getStatusCode());
            expect(response.getStatusCode()).to.be(200);
            done();
        });
    });


    it("should find the mocked GET service, run it and next afterwards with data attached to response", function (done) {

        var method = "POST",
            path = "/services/test",
            data = { "da" : "ta" };

        var request = new Request(method, path, data),
            response = new Response();

        runService(request, response, function(err) {

            console.log(request, response);
            expect(response.getStatusCode()).to.be(200);
            expect(response.getData()).to.be({ "da" : "ta"});
            done();
        });
    });
});