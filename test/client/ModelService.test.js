"use strict";

var expect = require("expect.js"),
    ModelCache = require("../testHelpers/ModelCache.class.js"),
    Octocat = require("../shared/Model/Octocat.class.js"),
    RemoteService = require("../../lib/client/RemoteService.class.js"),
    services = require("../../lib/shared/registries/serviceRegistry.js"),
    sharedModelServiceTest = require("../shared/ModelService.test.js"),
    Octoduck = require("../shared/Model/OctoDuck.class.js");

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
    ],
    testService,
    octocat;

describe("Model-Services", function () {
    var readCollection,
        read,
        create;

    sharedModelServiceTest("client");

    describe("Client", function () {

        before(function () {
            services.getService = function () {
                return testService;
            };

            Octocat.cache = new ModelCache();
            Octoduck.cache = new ModelCache();

            readCollection = RemoteService.prototype.readCollection;
            RemoteService.prototype.readCollection = function RemoteReadCollection(remote, ids, params, callback) {

                callback({
                    status : "success",
                    data : [
                        {
                            id : 1,
                            name : "RemoteOcto",
                            age : 12
                        }
                    ]
                });
            };

            readCollection = RemoteService.prototype.read;
            RemoteService.prototype.read = function RemoteRead(remote, ids, callback) {

                callback({
                    status : "success",
                    data : {
                        id : 1,
                        name : "RemoteOcto",
                        age : 12
                    }
                });
            };

            create = RemoteService.prototype.create;
            RemoteService.prototype.create = function (remote, ids, model, callback) {
                callback({
                    status : "success",
                    data : {
                        id : 2,
                        name : "remoteOcto"
                    }
                });
            };
        });

        after(function () {
            RemoteService.prototype.readCollection = readCollection;
            RemoteService.prototype.read = read;
            RemoteService.prototype.create = create;
        });

        describe("CRUD", function () {

            beforeEach(function () {

                octocat = new Octocat();

                testService = {
                    create : function (remote, ids, model, callback) {
                        callback({ status : "success", data : { id : 1, name : model.get("name"), age : 10 }});
                    },
                    read : function (remote, ids, callback) {
                        callback({ status : "success", data : { id : 2, name : "hans", age : 12 }});
                    },
                    update : function (remote, ids, model, callback) {
                        callback({ status : "success", data : { name : "updated" + model.get("name"), age : 12 }});
                    },
                    destroy : function (remote, ids, callback) {
                        callback({ status : "success" });
                    }
                };

                octocat.setService(testService);
            });

            describe("Error handling and format parsing (__processResponse)", function () {

                it("should contact the remote service if no local service is defined", function (done) {
                    octocat.setService({});
                    octocat.save(function (err) {
                        expect(err).to.be(null);
                        expect(octocat.get("name")).to.be("remoteOcto");
                        done();
                    });
                });
            });

        });

        describe("Statics", function () {

            describe("#find", function () {

                beforeEach(function () {
                    Octocat.prototype._service = testService = {
                        readCollection : function (remote, ids, params, callback) {
                            callback({ status : "success", data : mockedOctocats });
                        }
                    };
                });

                it("should call the static method and run the mocked readCollection-service", function (done) {
                    Octocat.find({}, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models[0].get("name")).to.eql("Octo 1");
                        expect(models[1].get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                describe("Signature", function() {

                    it("should accept ids as first argument if called with three args", function (done) {

                        var testIds = { octocat : 1 },
                            testParams = { pa : "ram" },
                            testCb = function() {};

                        testService.readCollection = function(remote, ids, params, callback) {
                            expect(remote).to.be.a("function");
                            expect(ids).to.eql(testIds);
                            expect(params).to.eql(testParams);
                            done();
                        };

                        Octocat.find(testIds, testParams, testCb);
                    });

                    it("should accept remote as first argument if called with three args ", function (done) {

                        var testIds = { octocat : 1 },
                            testCb = function() {};

                        testService.readCollection = function(remote, ids, params, callback) {
                            expect(remote).to.be(false);
                            expect(ids).to.eql(testIds);
                            expect(params).to.eql({});
                            done();
                        };

                        Octocat.find(false, testIds, testCb);
                    });

                    it("should accepts ids and callback if called with two args", function (done) {

                        var testIds = { octocat : 1 },
                            testCb = function() {};

                        testService.readCollection = function(remote, ids, params, callback) {
                            expect(remote).to.be.a("function");
                            expect(ids).to.eql(testIds);
                            expect(params).to.eql({});
                            done();
                        };

                        Octocat.find(testIds, testCb);
                    });
                });

                it("should call the remote-service if no client-service is defined", function (done) {

                    Octocat.prototype._service = null;

                    Octocat.find({ da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models[0].get("name")).to.eql("RemoteOcto");
                        done();
                    });
                });

                it("should fail if no client-service is defined and remote = false", function (done) {

                    Octocat.prototype._service = null;

                    Octocat.find(false, { da : "ta" }, function (err, models) {
                        expect(err).not.to.be(null);
                        done();
                    });
                });

                it("should pass the remote service as 'remote' attribute if called with remote = true", function (done) {

                    testService.readCollection = function (remote, ids, params, callback) {
                        expect(remote).to.be.a("function");
                        callback({ status : "success", data : mockedOctocats });
                    };

                    Octocat.find(true, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models[0].get("name")).to.eql("Octo 1");
                        expect(models[1].get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should not pass the remote function if called with remote = false", function (done) {

                    testService.readCollection = function (remote, ids, params, callback) {
                        expect(remote).to.be(false);
                        callback({ status : "success", data : mockedOctocats });
                    };

                    Octocat.find(false, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models[0].get("name")).to.eql("Octo 1");
                        expect(models[1].get("name")).to.eql("Octo 2");
                        done();
                    });
                });
            });

            describe("#findById", function () {

                before(function () {
                    Octocat.cache = null;
                });
                beforeEach(function () {
                    Octocat.prototype._service = testService = {
                        read : function mockedRead(remote, ids, callback) {
                            var octocat = mockedOctocats[ids.octocat - 1];
                            callback({ status : "success", data : octocat });
                        }
                    };
                });

                describe("Signature", function() {

                    it("should work with findById(1, callback) ", function (done) {

                        var testId = 1;

                        testService.read = function(remote, ids, callback) {
                            expect(remote).to.be.a("function");
                            expect(ids).to.eql({ "octocat" : testId });
                            expect(callback).to.be.a("function");
                            done();
                        };

                        Octocat.findById(testId, function(err, res) {});
                    });

                    it("should work with findById(false, id, callback) ", function (done) {

                        var testId = 1;

                        testService.read = function(remote, ids, callback) {
                            expect(remote).to.be(false);
                            expect(ids).to.eql({ "octocat" : testId });
                            expect(callback).to.be.a("function");
                            done();
                        };

                        Octocat.findById(false, testId, function(err, res) {});
                    });

                    it("should work with findById({}, id, callback) ", function (done) {

                        var testId = 1,
                            testIds = { ocotoduck : 2 };

                        testService.read = function(remote, ids, callback) {
                            expect(remote).to.be.a("function");
                            expect(ids.octocat).to.eql(testId);
                            expect(ids.octoduck).to.eql(testIds.octoduck);
                            expect(callback).to.be.a("function");
                            done();
                        };

                        Octocat.findById(testIds, testId, function(){});
                    });

                    it("should work with findById(true, {}, id, callback) ", function (done) {

                        var testId = 1,
                            testIds = { ocotoduck : 2 };

                        testService.read = function(remote, ids, callback) {
                            expect(remote).to.be.a("function");
                            expect(ids.octocat).to.eql(testId);
                            expect(ids.octoduck).to.eql(testIds.octoduck);
                            expect(callback).to.be.a("function");
                            done();
                        };

                        Octocat.findById(true, testIds, testId, function() {});
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

                it("should call the remote service if no client service is defined", function (done) {

                    Octocat.prototype._service = null;

                    Octocat.findById(1, function (err, model) {
                        expect(err).to.be(null);
                        expect(model.get("name")).to.eql("RemoteOcto");
                        done();
                    });
                });

                it("should return an error if no service is defined when called with remote = false", function (done) {

                    Octocat.prototype._service = null;

                    Octocat.findById(false, 1, function (err, model) {
                        expect(err).to.be.an(Error);
                        done();
                    });
                });

                it("should pass the remote service as 'remote' attribute if called with remote = true", function (done) {

                    testService.read = function (remote, id, callback) {
                        expect(remote).to.be.a("function");
                        callback({
                            status : "success",
                            data : {
                                id : 1,
                                name : "RemoteOcto"
                            }
                        });
                    };

                    Octocat.findById(1, function (err, model) {
                        expect(err).to.be(null);
                        expect(model.get("name")).to.eql("RemoteOcto");
                        done();
                    });
                });
            });
        });

        describe("Model-Loader (Model-Caching)", function () {
            describe("#find", function () {
                it("should return a cached instance", function (done) {
                    Octoduck.findById(2, function (err, octo) {
                        expect(octo).to.be.an(Octoduck);
                        octo.set("name", "emil");
                        Octoduck.findById(2, function (err, octo2) {
                            expect(octo).to.be(octo2);
                            expect(octo2.get("name")).to.be("emil");
                            octo2.set("name", "erpel");
                            expect(octo2.get("name")).to.be("erpel");
                            expect(octo.get("name")).to.be("erpel");
                            done();
                        });
                    });
                });

                it("should not cache instances created with new", function (done) {
                    var octo = new Octoduck(24);
                    octo.set("name", "old emil");

                    Octoduck.findById(24, function (err, octo2) {
                        expect(octo).to.be.an("object");
                        expect(octo2).not.to.eql(octo);
                        expect(octo2.get("name")).to.be("emil");
                        octo2.set("name", "crazy duck");
                        expect(octo2.get("name")).to.be("crazy duck");
                        expect(octo.get("name")).to.be("old emil");
                        done();
                    });
                });
            });

            describe("#save", function () {

                it("should add an instance to the registry after successful saving", function (done) {

                    var octo = new Octoduck();

                    //id gets set internally after .save
                    octo.save(function (err, res) {

                        Octoduck.findById(2, function (err, octo2) {
                            expect(octo).to.be(octo2);
                            done();
                        });
                    });
                });
            });
        });
    });
});