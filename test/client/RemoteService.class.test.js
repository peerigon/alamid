"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    Car = require("./mocks/models/CarModel.class.js");

describe("RemoteService", function () {

    var RemoteService,
        modelMock = {
            getUrl : function () {
                return "blogpost";
            },
            getIds : function () {
                return null;
            },
            toJSON : function () {
                return JSON.stringify({ da : "ta "});
            },
            get : function () {
                return { da : "ta" };
            },
            getChanged : function() {
                return { da : "ta" };
            }
        };

    beforeEach(function () {
        RemoteService = rewire("../../lib/client/RemoteService.class.js");
        //mocking the routes
        RemoteService.__set__("config", {
            routes : {
                services : "/services",
                validators : "/validators"
            }
        });
    });

    it("should return a valid RemoteService", function () {
        var service = new RemoteService("blogpost");
        expect(service.read).to.be.a("function");
        expect(service.create).to.be.a("function");
        expect(service.update).to.be.a("function");
        expect(service.destroy).to.be.a("function");
    });

    it("should pass the right data to the dom-adapter request", function (done) {

        var requestMock = function (method, url, model, callback) {
                expect(method.toLowerCase()).to.be("create");
                expect(url).to.contain("services/blogpost");
                expect(model).to.eql({ da : "ta"});
                callback();
            },
            remoteService;

        RemoteService.__set__("request", requestMock);

        remoteService = new RemoteService("blogpost");
        remoteService.create(true, modelMock, function (response) {
            done();
        });

    });

    it("should incorporate all ids into the request url", function (done) {

        var requestMock = function (method, url, model, callback) {
                expect(method.toLowerCase()).to.be("update");
                expect(url).to.contain("services/blogpost/12/comment/3");
                expect(model).to.eql({ da : "ta"});
                callback();
            },
            ids = {
                "blogpost": 12,
                "blogpost/comment": 3
            },
            remoteService;

        RemoteService.__set__("request", requestMock);

        remoteService = new RemoteService("blogpost/comment");
        remoteService.update(true, ids, modelMock, function (response) {
            done();
        });

    });

    it("should pass only changedData to the updateService", function(done) {

        var requestMock = function (method, url, model, callback) {
                expect(method.toLowerCase()).to.be("update");
                expect(url).to.contain("services/car/12");
                expect(model).to.eql({ manufactor : "Peugeot"});
                callback();
            },
            car = new Car(),
            remoteService;

        car.set("model", "A3");
        car.set("manufactor", "Audi");
        car.accept();
        car.set("manufactor", "Peugeot");

        RemoteService.__set__("request", requestMock);

        remoteService = new RemoteService("car");
        remoteService.update(true, {car : 12 }, car, function (response) {
            done();
        });

    });
});