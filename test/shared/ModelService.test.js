"use strict";

var expect = require("expect.js"),
    Octocat = require("../shared/Model/Octocat.class.js"),
    ModelCache = require("../testHelpers/ModelCache.class.js");

function sharedModelServiceTest(env) {

    /**
     * always accepts the client-serviceSignature and maps it
     * depending on env to service or client calls
     *
     * @param service
     * @param method
     * @param serviceFunction
     */
    function setServiceMethod(service, method, serviceFunction) {

        if(env === "client") {
            service[method] = serviceFunction;
            return;
        }

        switch(method) {

            case "create" :
                service[method] = function createWrapper(ids, model, callback) {
                    return serviceFunction.call(this, null, ids, model, callback);
                };
                break;
            case "update" :
                service[method] = function updateWrapper(ids, model, callback) {
                    return serviceFunction.call(this, null, ids, model, callback);
                };
                break;
            case "read" :
                service[method] = function readWrapper(ids, callback) {
                    return serviceFunction.call(this, null, ids, callback);
                };
                break;
            case "readCollection" :
                service[method] = function readCollectionWrapper(ids, params, callback) {
                    return serviceFunction.call(this, null, ids, params, callback);
                };
                break;
            case "destroy" :
                service[method] = function destroyWrapper(ids, callback) {
                    return serviceFunction.call(this, null, ids, callback);
                };
                break;
        }
    }

    var mockedOctocats = [
        {
            id : 1,
            name : "Octo 1",
            age : 12
        },
        {
            id : 2,
            name : "Octo 2",
            age : 10
        }
    ];

    describe("Shared", function () {

        describe("CRUD", function () {

            var octocat,
                testService;

            beforeEach(function () {

                octocat = new Octocat();
                testService = {};

                setServiceMethod(testService, "create", function (remote, ids, model, callback) {
                    callback({ status : "success", data : { id : 1, name : model.get("name"), age : 10 }});
                });

                setServiceMethod(testService, "read", function (remote, ids, callback) {
                    callback({ status : "success", data : { id : 2, name : "hans", age : 12 }});
                });

                setServiceMethod(testService, "update", function (remote, ids, model, callback) {
                    callback({ status : "success", data : { name : "updated" + model.get("name"), age : 12 }});
                });

                setServiceMethod(testService, "destroy", function (remote, ids, callback) {
                    callback({ status : "success" });
                });

                octocat.setService(testService);
            });

            describe("Error handling and format parsing (__processResponse)", function () {

                it("should fail if response is no valid object", function (done) {

                    function mockedCreate(remote, ids, model, callback) {
                        callback();
                    }

                    setServiceMethod(testService, "create", mockedCreate);

                    octocat.save(function (err) {
                        expect(err).not.to.be(null);
                        done();
                    });
                });

                it("should convert an error-response to an internal error", function (done) {

                    function mockedCreate(remote, ids, model, callback) {
                        callback({ status : "error", message : "my error message" });
                    }

                    setServiceMethod(testService, "create", mockedCreate);

                    octocat.save(function (err) {
                        expect(err.message).to.contain("my error message");
                        done();
                    });
                });
            });

            describe("#fetch", function () {

                it("should call the fetch service if the ID is set and successfully fetch the data", function (done) {

                    octocat.setId(2);

                    octocat.fetch(function (err) {
                        expect(err).to.be(null);
                        expect(octocat.get("age")).to.be(12);
                        expect(octocat.get("name")).to.be("hans");
                        expect(octocat.getId()).to.be(2);
                        done();
                    });
                });

                it("should call 'accept' after a successful fetch", function (done) {

                    octocat.setId(2);

                    octocat.fetch(function (err) {
                        expect(err).to.be(null);
                        expect(octocat.get("age")).to.be(12);
                        expect(octocat.get("name")).to.be("hans");
                        expect(octocat.getChanged()).to.eql({});
                        expect(octocat.getId()).to.be(2);
                        done();
                    });
                });

                it("should throw return an error if no id is set", function (done) {
                    octocat.fetch(function (err) {
                        expect(err).to.be.an(Error);
                        done();
                    });
                });

                describe("(with cache)", function () {

                    beforeEach(function () {
                        Octocat.cache = new ModelCache();
                    });

                    after(function () {
                        delete Octocat.cache;
                    });


                    it("should add a new instance to the cache after fetch", function () {

                        octocat.setId(2);
                        expect(Octocat.cache.get("octocat/2")).to.be(undefined);
                        octocat.fetch(function (err) {
                            expect(err).to.be(null);
                            expect(Octocat.cache.get("octocat/2")).to.be(octocat);
                        });

                    });

                });
            });

            describe("#save", function () {

                describe("create", function () {

                    it("should call the create service if the ID is not set and return successfully with an ID set", function (done) {

                        octocat.set('name', 'Octocat');
                        expect(octocat.getId()).to.be(null);

                        octocat.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            expect(err).to.be(null);
                            expect(octocat.get("age")).to.be(10);
                            expect(octocat.get("name")).to.be("Octocat");
                            expect(octocat.getId()).to.be(1);
                            done();
                        });
                    });

                    it("should call 'accept' after successful create", function (done) {

                        octocat.set('name', 'Octocat');

                        expect(octocat.getChanged()).to.eql({ name : "Octocat" });

                        octocat.save(function (err) {
                            expect(err).to.be(null);
                            expect(octocat.getChanged()).to.eql({});
                            expect(octocat.get("name")).to.be("Octocat");
                            done();
                        });
                    });
                });

                describe("update", function () {

                    it("should call the update service if an ID is set and return successfully", function (done) {

                        octocat = new Octocat(2);

                        octocat.setService(testService);

                        octocat.set('name', 'Octocat');
                        octocat.set('age', 8);
                        expect(octocat.getId()).to.be(2);

                        octocat.save(function (err) {
                            expect(err).to.be(null);
                            expect(octocat.getId()).to.be(2);
                            expect(octocat.get("age")).to.be(12);
                            expect(octocat.get("name")).to.be("updatedOctocat");
                            done();
                        });
                    });

                    it("should call 'accept' after a successful update", function (done) {

                        octocat = new Octocat(2);

                        octocat.setService(testService);

                        octocat.set('name', 'Octocat');
                        octocat.set('age', 8);

                        expect(octocat.getChanged()).to.eql({ name : "Octocat", age : 8 });

                        expect(octocat.getId()).to.be(2);

                        octocat.save(function (err) {

                            expect(err).to.be(null);

                            expect(octocat.getId()).to.be(2);
                            expect(octocat.get("age")).to.be(12);
                            expect(octocat.get("name")).to.be("updatedOctocat");
                            expect(octocat.getChanged()).to.eql({});
                            done();
                        });
                    });

                });
            });

            describe("#destroy", function () {

                function mockedDestroy(remote, ids, callback) {
                    callback({ status : "success" });
                }

                it("call the delete service if ID is set and return successfully", function (done) {
                    octocat = new Octocat(2);

                    setServiceMethod(testService, "destroy", mockedDestroy);

                    octocat.setService(testService);
                    octocat.destroy(function (err) {
                        expect(err).to.be(null);
                        done();
                    });
                });

                it("should call 'accept' after an successful destroy", function (done) {

                    octocat = new Octocat(2);

                    setServiceMethod(testService, "destroy", mockedDestroy);

                    octocat.setService(testService);

                    octocat.set("name", "destroyoCat");
                    expect(octocat.getChanged()).to.eql({ name : "destroyoCat" });

                    octocat.destroy(function (err) {
                        expect(err).to.be(null);
                        expect(octocat.getChanged()).to.eql({});
                        done();
                    });

                });

                it("should fail with a missing ID", function (done) {
                    testService.destroy = mockedDestroy;
                    octocat.setService(testService);
                    expect(octocat.getId()).to.be(null);

                    octocat.destroy(function (err) {
                        expect(err).to.be.an(Error);
                        done();
                    });
                });
            });
        });

        describe("Statics", function () {

            var Octocat,
                testService,
                services;

            before(function () {
                Octocat = require("../shared/Model/Octocat.class.js");
                services = require("../../lib/shared/registries/serviceRegistry.js");
                services.getService = function () {
                    return testService;
                };
            });

            beforeEach(function () {
                Octocat.cache = new ModelCache();
                testService = {};
            });

            describe("#find", function () {

                beforeEach(function () {

                    function mockedReadCollection(remote, ids, params, callback) {
                        callback({ status : "success", data : mockedOctocats });
                    }

                    setServiceMethod(testService, "readCollection", mockedReadCollection);
                });

                it("should call the static method and run the mocked readCollection-service", function (done) {
                    Octocat.find({}, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models[0].get("name")).to.eql("Octo 1");
                        expect(models[1].get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should work if called with ids and params", function (done) {
                    Octocat.find({}, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models[0].get("name")).to.eql("Octo 1");
                        expect(models[1].get("name")).to.eql("Octo 2");
                        done();
                    });
                });
            });

            describe("#findById", function () {

                beforeEach(function () {

                    setServiceMethod(testService, "read", function mockedRead(remote, ids, callback) {
                        var octocat = mockedOctocats[ids.octocat - 1];
                        callback({ status : "success", data : octocat });
                    });
                });

                it("should work with findById(1, callback) ", function (done) {
                    Octocat.findById(1, function (err, model) {
                        expect(err).to.be(null);
                        expect(model.get("name")).to.eql("Octo 1");
                        done();
                    });
                });

                it("should work with findById({}, id, callback) ", function (done) {
                    Octocat.findById({}, 2, function (err, model) {
                        expect(err).to.be(null);
                        expect(model.get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should append the ids to the octocat ", function (done) {

                    Octocat.findById({ "group" : 2}, 1, function (err, model) {
                        expect(err).to.be(null);
                        expect(model.get("name")).to.eql("Octo 1");
                        expect(model.getId("group")).to.eql(2);
                        done();
                    });
                });

                it("should return an error if the response-processing fails (i.e. unknown fields) ", function (done) {

                    function mockedRead (remote, ids, callback) {
                        callback({
                            status : "success",
                            data : {
                                id : 2,
                                name : "Octo 2",
                                wrongField : 10
                            }
                        });
                    }

                    setServiceMethod(testService, "read", mockedRead);

                    Octocat.findById(1, function (err, model) {
                        expect(err).to.be.an(Error);
                        done();
                    });
                });
            });
        });
    });
}

module.exports = sharedModelServiceTest;