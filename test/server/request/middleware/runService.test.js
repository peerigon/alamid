"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass"),
    path = require("path");

nodeclass.registerExtension();

var Request = require("../../../../lib/server/request/Request.class.js"),
    Response = require("../../../../lib/server/request/Response.class.js");

nodeclass.stdout = function() {
    //No output in test mode
};

describe("runService", function(){

    var runService = rewire("../../../../lib/server/request/middleware/runService.js", false);
    var Dog = require("./runService/src/Dog.class.js");

    describe("#serviceMiddleware", function() {

        var mockedServiceFunctions;

        before(function() {

            mockedServiceFunctions = {
                create : function(ids, model, callback){
                    callback({ "status" : "success" });
                },
                read : function(ids, callback){
                    callback({ "status" : "success", data : { da : "ta" }});
                },
                readCollection : function(ids, params, callback){
                    callback({ "status" : "success", "data" : { "readCollection" : true }});
                },
                update : function(ids, model, callback){
                    callback();
                }
                //delete is not here because we need a missing method for the test
            };

            var servicesMock = {
                getService : function(path) {

                    if(path === "test"){
                        return mockedServiceFunctions;
                    }

                    if(path === "test2"){
                        return {};
                    }

                    if(path === "syncasynctest") {
                        return {
                            create : function(ids, model) {
                                return { status : "success"};
                            },
                            delete : function(ids, callback) {
                                callback({ status : "success" });
                            }
                        };
                    }
                    return null;
                }
            };

            runService.__set__("services", servicesMock);
        });

        it("should find the mocked CREATE service, run it and next afterwards", function (done) {

            var method = "create",
                path = "/services/test/",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });

        it("should call the CREATE service on the Model if Model was loaded", function (done) {

            var method = "create",
                path = "/services/test/",
                data = { "da" : "ta" };

            var dog = new Dog();
            dog.set("name", "snoop lion");
            dog.setService(mockedServiceFunctions);

            var request = new Request(method, path, data),
                response = new Response();

            request.setModel(dog);

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });

        it("should find the READ service, run it and next afterwards with data attached to response", function (done) {

            var method = "read",
                path = "/services/test/123",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.eql(data);
                done();
            });
        });

        it("should call the READ-collection method without IDs set", function (done) {

            var method = "read",
                path = "/services/test",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.eql({ "readCollection" : true });
                done();
            });
        });


        it("should next with an error code if the service for the given method is not allowed", function (done) {

            var method = "delete",
                path = "/services/test",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function(err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(405);
                done();
            });
        });

        it("should next with error code 403 if no service is registered for a given path", function (done) {

            var method = "delete",
                path = "/services/test2",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function(err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(403);
                done();
            });
        });

        it("should next with an err if path is not defined", function (done) {

            var method = "delete",
                path = "/services/nonExistingPath",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(404);
                done();
            });
        });

        it("should accept synchronous functions as services", function(done) {
            var method = "create",
                path = "/services/syncasynctest",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });

        it("should accept asynchronous functions as services", function(done) {
            var method = "delete",
                path = "/services/syncasynctest",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });


    });

    describe("#serviceFormat", function() {

        before(function() {
            var servicesMock = {
                getService : function(path) {
                    if(path === "servicea"){
                        var ServiceA = require("./runService/src/AService.server.class.js");
                        return new ServiceA();
                    }
                    return null;
                }
            };

            runService.__set__("services", servicesMock);
        });

        it("should accept classes as services", function(done) {

            var method = "update",
                path = "/services/servicea",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.eql(data);
                done();
            });
        });
    });

    describe("#service with deeper hierarchy - embedded documents", function() {

        before(function() {
            var servicesMock = {
                getService : function(path) {
                    if(path === "blogpost/comments"){
                        var ServiceA = require("./runService/src/AService.server.class.js");
                        return new ServiceA();
                    }
                    return null;
                }
            };

            runService.__set__("services", servicesMock);
        });

        it("should accept services with deeper paths", function(done) {

            var method = "delete",
                path = "/services/blogpost/123/comments/1245",
                data = {};

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(request.getIds()).to.eql({ "blogpost": '123', "blogpost/comments": '1245' });
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });
    });

    describe("#Callback value assignment", function() {

        before(function() {
            var servicesMock = {
                getService : function(path) {
                    if(path === "blogpost"){
                        return {
                            "create" : function(ids, model, callback){
                                callback({"status" : "success", "errorMessage" : "my dummy error", "data" : { "da" : "ta" }});
                            },
                            "update" : function(ids, model, callback){
                                callback();
                            }
                        };
                    }
                    return null;
                }
            };

            runService.__set__("services", servicesMock);
        });

        it("should accept the values that have been set via callback", function(done) {

            var method = "create",
                path = "/services/blogpost/",
                data = {};

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function(err) {
                expect(request.getIds()).to.eql({});
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getStatus()).to.be("success");
                expect(response.getErrorMessage()).to.be("my dummy error");
                expect(response.getData()).to.eql({ "da" : "ta" });
                done();
            });
        });

        it("should throw an error with an empty callback", function(done) {

            var method = "update",
                path = "/services/blogpost/",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).not.to.be(null);
                done();
            });
        });
    });
});