"use strict";

var expect = require("expect.js"),
    Octocat = require("../shared/Model/Octocat.class.js");

var sharedModelServiceTest = require("../shared/ModelService.test.js");

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

    sharedModelServiceTest("client");

    describe("Client", function () {

        describe("CRUD", function () {

            var octocat,
                testService,
                RemoteService = require("../../lib/client/RemoteService.class.js");

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

                    RemoteService.prototype.create = function (remote, ids, model, callback) {
                        callback({
                            status : "success",
                            data : {
                                id : 2,
                                name : "remoteOcto"
                            }
                        });
                    };

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

            var Octocat,
                modelCache,
                testService,
                RemoteService,
                services;

            before(function () {

                services = require("../../lib/shared/registries/serviceRegistry.js");
                services.getService = function () {
                    return testService;
                };

                Octocat = require("../shared/Model/Octocat.class.js");
                RemoteService = require("../../lib/client/RemoteService.class.js");

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

                modelCache = require("../../lib/shared/modelCache.js");
            });

            beforeEach(function () {
                //we have to reset the cache, because we want fresh instances
                modelCache.reset();
            });

            describe("#find", function () {

                beforeEach(function () {
                    testService = {
                        readCollection : function (remote, ids, params, callback) {
                            callback({ status : "success", data : mockedOctocats });
                        }
                    };
                });

                it("should call the static method and run the mocked readCollection-service", function (done) {
                    Octocat.find({}, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should accept remote as first argument", function (done) {
                    Octocat.find(true, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should accept remote as first argument", function (done) {
                    Octocat.find(true, {}, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should accept remote as first argument when called with three arguments ", function (done) {
                    Octocat.find(false, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should accept requests without ids and remote as arguments", function (done) {
                    Octocat.find({ da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should call the remote-service if no client-service is defined", function (done) {

                    testService = null;

                    Octocat.find({ da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("RemoteOcto");
                        done();
                    });
                });

                it("should fail if no client-service is defined and remote = false", function (done) {

                    testService = null;

                    Octocat.find(false, { da : "ta" }, function (err, models) {
                        expect(err).not.to.be(null);
                        done();
                    });
                });

                it("should pass the remote service as 'remote' attribute if called with remote = true", function (done) {

                    testService = {
                        readCollection : function (remote, ids, params, callback) {
                            expect(remote).to.be.a("function");
                            callback({ status : "success", data : mockedOctocats });
                        }
                    };

                    Octocat.find(true, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should not pass the remote function if called with remote = false", function (done) {

                    testService = {
                        readCollection : function (remote, ids, params, callback) {
                            expect(remote).to.be(false);
                            callback({ status : "success", data : mockedOctocats });
                        }
                    };

                    Octocat.find(false, { da : "ta" }, function (err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });
            });

            describe("#findById", function () {

                before(function () {
                    Octocat = require("../shared/Model/Octocat.class.js");
                });

                beforeEach(function () {

                    testService = {
                        read : function mockedRead(remote, ids, callback) {
                            var octocat = mockedOctocats[ids.octocat - 1];
                            callback({ status : "success", data : octocat });
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

                it("should work with findById(false, id, callback) ", function (done) {
                    Octocat.findById(false, 1, function (err, model) {
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

                it("should work with findById(true, {}, id, callback) ", function (done) {
                    Octocat.findById(true, {}, 2, function (err, model) {
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

                it("should call the remote service if no client service is defined", function (done) {

                    testService = null;

                    Octocat.findById(1, function (err, model) {
                        expect(err).to.be(null);
                        expect(model.get("name")).to.eql("RemoteOcto");
                        done();
                    });
                });

                it("should return an error if no service is defined when called with remote = false", function (done) {

                    testService = null;

                    Octocat.findById(false, 1, function (err, model) {
                        expect(err).to.be.an(Error);
                        done();
                    });
                });

                it("should pass the remote service as 'remote' attribute if called with remote = true", function (done) {

                    testService = {
                        read : function (remote, id, callback) {

                            expect(remote).to.be.a("function");

                            callback({
                                status : "success",
                                data : {
                                    id : 1,
                                    name : "RemoteOcto"
                                }
                            });
                        }
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

            var Model;
            before(function () {
                var modelCache = require("../../lib/shared/modelCache.js"),
                    clientModelCache = require("../../lib/client/modelCache.client.js");

                //reMap functions
                modelCache.get = clientModelCache.get;
                modelCache.add = clientModelCache.add;

                Model = require("../../lib/shared/Model.class.js");
            });

            describe("#find", function () {

                var Octoduck;

                before(function () {
                    Octoduck = require("../shared/Model/OctoDuck.class.js");
                });

                it("should return a cached instance", function (done) {
                    Octoduck.findById(2, function (err, octo) {
                        expect(octo).to.be.an("object");
                        octo.set("name", "emil");
                        Octoduck.findById(2, function (err, octo2) {
                            expect(octo).to.eql(octo2);
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

                var Octoduck;

                before(function () {
                    Octoduck = require("../shared/Model/OctoDuck.class.js");
                });

                it("should add an instance to the registry after successful saving", function (done) {

                    var octo = new Octoduck();

                    //id gets set internally after .save
                    octo.save(function (err, res) {

                        Octoduck.findById(2, function (err, octo2) {
                            expect(octo).to.eql(octo2);
                            done();
                        });
                    });
                });
            });
        });
    });
});