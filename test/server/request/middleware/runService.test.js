"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path"),
    Request = require("../../../../lib/server/request/Request.class.js"),
    Response = require("../../../../lib/server/request/Response.class.js"),
    Dog = require("./runService/Dog.class.js");

describe("runService", function () {
    var runService;

    describe("#serviceMiddleware", function () {
        var serviceMock,
            currentServiceMock,
            servicesMock;

        serviceMock = {
            create: function (ids, model, callback) {
                callback({ "status": "success" });
            },
            read: function (ids, callback) {
                callback({ "status": "success", data: { da: "ta" } });
            },
            readCollection: function (ids, params, callback) {
                callback({
                    "status": "success",
                    "data": [
                        { "readCollection1": true },
                        { "readCollection2": true }
                    ]
                });
            },
            update: function (ids, model, callback) {
                callback();
            },
            destroy: function (ids, callback) {
                callback({ "status": "success" });
            }
        };

        servicesMock = {
            getService: function () {
                return currentServiceMock;
            }
        };

        beforeEach(function () {
            currentServiceMock = serviceMock;
            runService = rewire("../../../../lib/server/request/middleware/runService.js");
            runService.__set__("services", servicesMock);
        });

        it("should find the mocked CREATE service, run it and next afterwards", function (done) {

            var method = "create",
                path = "/services/test/",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function (err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });

        it("should call the CREATE service on the Model if Model was loaded", function (done) {

            var method = "create",
                path = "/services/test/",
                createCalled = false,
                dog;

            dog = new Dog();
            dog.set("name", "snoop lion");
            dog.setService({
                create : function (ids, model, callback) {
                    createCalled = true;
                    callback({ "status" : "success"});
                }
            });

            var request = new Request(method, path, {}),
                response = new Response();

            request.model = dog;
            delete request.data;

            runService(request, response, function (err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(createCalled).to.be(true);
                done();
            });
        });

        it("should find the READ service, run it and next afterwards with data attached to response", function (done) {

            var method = "read",
                path = "/services/test/123",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function (err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.eql(data);
                done();
            });

        });

        it("should call the READ-Collection method without ID set", function (done) {

            var method = "read",
                path = "/services/test",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function (err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.eql([
                    { "readCollection1" : true },
                    { "readCollection2" : true }
                ]);
                done();
            });
        });

        it("should next with error code 405 if the method is not defined", function (done) {

            var method = "destroy",
                path = "/services/test",
                destroy = serviceMock.destroy;

            var request = new Request(method, path),
                response = new Response();

            delete serviceMock.destroy;

            runService(request, response, function (err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(405);
                serviceMock.destroy = destroy;
                done();
            });

        });

        it("should next with error code 405 if the collection-method is not defined", function (done) {

            var method = "read",
                path = "/services/test",
                readCollection = serviceMock.readCollection;

            var request = new Request(method, path),
                response = new Response();

            delete serviceMock.readCollection;

            runService(request, response, function (err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(405);
                serviceMock.readCollection = readCollection;
                done();
            });

        });

        it("should next with error code 403 if no service is registered for a given path", function (done) {

            var method = "destroy",
                path = "/services/test",
                data = { "da": "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            currentServiceMock = {};

            runService(request, response, function (err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(403);
                done();
            });

        });

        it("should next with error code 404 if the path is not defined", function (done) {

            var method = "destroy",
                path = "/services/nonExistingPath",
                data = { "da": "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            currentServiceMock = null;

            runService(request, response, function (err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(404);
                done();
            });
        });

        it("should accept synchronous functions as services", function (done) {
            var method = "create",
                path = "/services/syncasynctest",
                data = { "da": "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            request.model = data;

            runService(request, response, function (err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });

        it("should accept asynchronous functions as services", function (done) {
            var method = "destroy",
                path = "/services/syncasynctest",
                data = { "da": "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            request.model = data;

            runService(request, response, function (err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });

    });

    describe("#serviceFormat", function () {

        var runService;

        var servicesMock = {
            getService: function (path) {
                if (path === "servicea") {
                    var ServiceA = require("./runService/AService.server.class.js");
                    return new ServiceA();
                }
                return null;
            }
        };

        beforeEach(function () {
            runService = rewire("../../../../lib/server/request/middleware/runService.js");
            runService.__set__("services", servicesMock);
        });

        it("should accept classes as services", function (done) {

            var method = "update",
                path = "/services/servicea",
                data = { "da": "ta" };

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.model = data;

            runService(request, response, function (err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.eql(data);
                done();
            });
        });
    });

    describe("#service with deeper hierarchy - embedded documents", function () {

        var runService;

        var servicesMock = {
            getService: function (path) {
                if (path === "blogpost/comments") {
                    var ServiceA = require("./runService/AService.server.class.js");
                    return new ServiceA();
                }
                return null;
            }
        };

        beforeEach(function () {
            runService = rewire("../../../../lib/server/request/middleware/runService.js");
            runService.__set__("services", servicesMock);
        });

        it("should accept services with deeper paths", function (done) {

            var method = "destroy",
                path = "/services/blogpost/123/comments/1245",
                data = {};

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.model = data;

            runService(request, response, function (err) {
                expect(request.ids).to.eql({ "blogpost": '123', "blogpost/comments": '1245' });
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });
    });

    describe("#Callback value assignment", function () {

        var runService;

        var servicesMock = {
            getService: function (path) {
                if (path === "blogpost") {
                    return {
                        "create": function (ids, model, callback) {
                            callback({"status": "success", "message": "my dummy error", "data": { "da": "ta" }});
                        },
                        "update": function (ids, model, callback) {
                            callback();
                        }
                    };
                }
                return null;
            }
        };

        beforeEach(function () {
            runService = rewire("../../../../lib/server/request/middleware/runService.js");
            runService.__set__("services", servicesMock);
        });

        it("should accept the values that have been set via callback", function (done) {

            var method = "create",
                path = "/services/blogpost/",
                data = {};

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function (err) {
                expect(request.ids).to.eql({});
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getStatus()).to.be("success");
                expect(response.getErrorMessage()).to.be("my dummy error");
                expect(response.getData()).to.eql({ "da": "ta" });
                done();
            });
        });

        it("should throw an error with an empty callback", function (done) {

            var method = "update",
                path = "/services/blogpost/",
                data = { "da": "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            //we have no middleware for setting the model in this test!
            request.model = data;

            runService(request, response, function (err) {
                expect(err).not.to.be(null);
                done();
            });
        });

    });
});