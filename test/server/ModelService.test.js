"use strict";

var expect = require("expect.js");

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

describe("Model-Services", function () {

    describe("Server", function () {

        var Octocat,
            testService,
            env;

        before(function () {

            Octocat = require("./../shared/Model/Octocat.class.js");
            var services = require("../../lib/shared/registries/serviceRegistry.js");
            services.getService = function () {
                return testService;
            };
        });

        describe("CRUD", function () {

            var octocat;

            beforeEach(function () {

                octocat = new Octocat();
                octocat.setService(testService);

                testService = {
                    create : function (ids, model, callback) {
                        callback({ status : "success", data : { name : model.get("name"), age : 10 }});
                    },
                    update : function (ids, model, callback) {
                        callback({ status : "success", data : { name : model.get("name"), age : 12 }});
                    },
                    destroy : function (ids, callback) {
                        callback({ status : "success" });
                    }
                };
            });

            describe("Error handling and format parsing (__processResponse)", function () {
                it("should fail if response is no valid object", function (done) {

                    testService.create = function (ids, model, callback) {
                        callback();
                    };

                    octocat = new Octocat();

                    octocat.save(function (err) {
                        expect(err).not.to.be(null);
                        done();
                    });
                });

                it("should fail if no service is defined for requests", function (done) {
                    octocat.setService({});
                    octocat.save(function (err) {
                        expect(err).not.to.be(null);
                        done();
                    });
                });

                it("should convert an error-response to an internal error", function (done) {

                    testService.create = function mockedCreate(ids, model, callback) {
                        callback({ status : "error", message : "my error message" });
                    };

                    octocat.setService(testService);

                    octocat.save(function (err) {
                        expect(err.message).to.contain("my error message");
                        done();
                    });
                });
            });

            describe("#save", function () {

                it("call the update service if ID is set and return successfully", function (done) {
                    octocat = new Octocat(2);
                    octocat.setService(testService);
                    octocat.set('name', 'Octocat');
                    octocat.set('age', 8);
                    expect(octocat.getId()).to.be(2);

                    octocat.save(function (err) {
                        expect(err).to.be(null);
                        expect(octocat.getId()).to.be(2);
                        expect(octocat.get("age")).to.be(12);
                        expect(octocat.get("name")).to.be("Octocat");
                        done();
                    });
                });

                it("call the create service if ID is not set and return successfully", function (done) {
                    octocat.set('name', 'Octocat');
                    expect(octocat.getId()).to.be(null);

                    octocat.save(function (err) {
                        expect(err).to.be(null);
                        expect(octocat.get("age")).to.be(10);
                        expect(octocat.get("name")).to.be("Octocat");
                        done();
                    });
                });

                it("should also work with sync services", function (done) {

                    testService.create = function (ids, model) {
                        return { status : "success", data : { age : 10 } };
                    };

                    octocat.set('name', 'Octocat');
                    expect(octocat.getId()).to.be(null);

                    octocat.save(function (err) {
                        expect(err).to.be(null);
                        expect(octocat.get("age")).to.be(10);
                        expect(octocat.get("name")).to.be("Octocat");
                        done();
                    });
                });
            });

            describe("#destroy", function () {

                function mockedDestroy(ids, callback) {
                    if (ids !== null) {
                        callback({ status : "success" });
                        return;
                    }
                    callback({ status : "error", message : "missing IDs" });
                }

                it("call the delete service if ID is set and return successfully", function (done) {
                    octocat = new Octocat(2);
                    testService.destroy = mockedDestroy;
                    octocat.setService(testService);
                    octocat.destroy(function (err) {
                        expect(err).to.be(null);
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

            describe("#findById", function () {

                beforeEach(function () {
                    testService = {
                        read : function (ids, callback) {
                            callback({ status : "success", data : mockedOctocats[ids.octocat - 1] });
                        },
                        readCollection : function (ids, params, callback) {
                            callback({ status : "success", data : mockedOctocats });
                        }
                    };
                });

                it("should work with findById(1, callback) ", function (done) {
                    Octocat.findById(1, function (err, model) {
                        expect(err).to.be(null);
                        expect(model.get("name")).to.eql("Octo 1");
                        done();
                    });
                });

                it("should fail if no server-service is defined", function (done) {

                    testService = null;

                    Octocat.findById(1, function (err, model) {
                        expect(err).to.be.an(Error);
                        done();
                    });
                });

                it("should return an error if the response-processing fails (i.e. unknown fields) ", function (done) {

                    testService.read = function (ids, callback) {

                        callback({
                            status : "success",
                            data : {
                                id : 2,
                                name : "Octo 2",
                                wrongField : 10
                            }
                        });
                    };

                    Octocat.findById(1, function (err, model) {
                        expect(err).to.be.an(Error);
                        done();
                    });
                });
            });

            describe("#find", function () {

                beforeEach(function () {
                    testService = {
                        readCollection : function (ids, params, callback) {
                            callback({ status : "success", data : mockedOctocats });
                        }
                    };
                });

                it("should work if called with ids and params", function (done) {
                    Octocat.find({}, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should fail if no server-service is defined", function (done) {

                    testService = null;

                    Octocat.find({}, function (err, models) {
                        expect(err).to.be.an(Error);
                        done();
                    });
                });
            });
        });
    });
});