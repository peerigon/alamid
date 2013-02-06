"use strict";

var expect = require("expect.js"),
    rewire = require("rewire");

function setEnv(env, which) {
    env.isServer = function () {
        return which === "server";
    };
    env.isClient = function () {
        return which === "client";
    };
}

describe("Model-Services", function(){

    /*
     var request = rewire("../../lib/client/helpers/request.js");

     request.__set__("domAdapter", {
     httpRequest : function(method, url, model, onHttpResponse){
     onHttpResponse(null, {
     status : "success",
     data : {
     method : method
     }
     });
     }
     });
     */

    var octocat, testService;
    var env = require("../../lib/shared/env.js");

    var Octocat = require("./Model/Octocat.class.js");

    before(function () {
        setEnv(env, "client");
    });

    after(function () {
        setEnv(env, "server");
    });

    beforeEach(function () {
        octocat = new Octocat();
        testService = {
            create : function(remote, ids, model, callback) {
                callback({ status : "success", data : { name : model.get("name"), age : 10 }});
            },
            update : function(remote, ids, model, callback) {
                callback({ status : "success", data : { name : model.get("name"), age : 12 }});
            },
            destroy : function(remote, ids, callback) {
                callback({ status : "success" });
            }
        };
    });

    describe("Error handling and format parsing (__processResponse)", function () {
        it("should fail if response is no valid object", function(done) {

            testService.create = function(remote, ids, model, callback) {
                callback();
            };

            octocat = new Octocat();
            octocat.setService(testService);
            octocat.save(function(err) {
                expect(err).not.to.be(null);
                done();
            });
        });

        it("should fail if no service is defined for requests", function(done) {
            octocat = new Octocat();
            octocat.setService({});
            octocat.save(function(err) {
                expect(err).not.to.be(null);
                done();
            });
        });

        it("should convert an error-response to an internal error", function(done) {
            octocat = new Octocat();
            octocat.setService({
                create : function(remote, ids, model, callback) {
                    callback({ status : "error", message : "my error message" });
                }
            });
            octocat.save(function(err) {
                expect(err.message).to.contain("my error message");
                done();
            });
        });
    });

    describe("#save", function () {

        it("call the update service if ID is set and return successfully", function(done) {
            octocat = new Octocat(2);
            octocat.setService(testService);
            octocat.set('name', 'Octocat');
            octocat.set('age', 8);
            expect(octocat.getId()).to.be(2);

            octocat.save(function(err) {
                expect(err).to.be(null);
                expect(octocat.getId()).to.be(2);
                expect(octocat.get("age")).to.be(12);
                expect(octocat.get("name")).to.be("Octocat");
                done();
            });
        });

        it("call the create service if ID is not set and return successfully", function(done) {
            octocat.setService(testService);
            octocat.set('name', 'Octocat');
            expect(octocat.getId()).to.be(null);

            octocat.save(function(err) {
                expect(err).to.be(null);
                expect(octocat.get("age")).to.be(10);
                expect(octocat.get("name")).to.be("Octocat");
                done();
            });
        });

        it("should also work with sync services", function(done) {
            octocat.setService({
                create : function(remote, ids, model) {
                    return { status : "success", data : { age : 10 } };
                }
            });
            octocat.set('name', 'Octocat');
            expect(octocat.getId()).to.be(null);

            octocat.save(function(err) {
                expect(err).to.be(null);
                expect(octocat.get("age")).to.be(10);
                expect(octocat.get("name")).to.be("Octocat");
                done();
            });
        });
    });

    describe("#destroy", function () {

        var mockedDeleteService = {
            destroy : function(remote, ids, callback) {
                if(ids !== null) {
                    callback({ status : "success" });
                    return;
                }
                callback({ status : "error", message : "missing IDs" });
            }
        };

        it("call the delete service if ID is set and return successfully", function(done) {
            octocat = new Octocat(2);
            octocat.setService(mockedDeleteService);

            octocat.destroy(function(err) {
                expect(err).to.be(null);
                done();
            });
        });

        it("should fail with a missing ID", function(done) {
            octocat = new Octocat();
            octocat.setService(mockedDeleteService);
            expect(octocat.getId()).to.be(null);

            octocat.save(function(err) {
                expect(err).to.be.an(Error);
                done();
            });
        });
    });

    describe("Statics", function(){

        describe("#findById", function () {

            var env = require("../../lib/shared/env.js");

            var Model,
                services,
                mockedOctocats;

            before(function () {
                setEnv(env, "client");
            });

            after(function () {
                setEnv(env, "server");
            });

            beforeEach(function () {

                mockedOctocats = [
                    {
                        id : 0,
                        name : "Octo 0",
                        age : 12
                    },
                    {
                        id : 1,
                        name : "Octo 1",
                        age : 10
                    },
                    {
                        id : 2,
                        name : "Octo 2",
                        age : 10
                    }
                ];

                var testService = {
                    read : function(remote, ids, callback) {
                        callback({ status : "success", data : mockedOctocats[ids.octocat] });
                    }
                };
                services = require("../../lib/shared/registries/serviceRegistry.js");
                services.getService =  function () {
                    return testService;
                };
                Octocat = require("./Model/Octocat.class.js");
            });

            it("should work with findById(1, callback) ", function(done) {
                Octocat.findById(1, function(err, model) {
                    expect(err).to.be(null);
                    expect(model.get("name")).to.eql("Octo 1");
                    done();
                });
            });

            it("should work with findById(false, id, callback) ", function(done) {
                Octocat.findById(false, 0, function(err, model) {
                    expect(err).to.be(null);
                    expect(model.get("name")).to.eql("Octo 0");
                    done();
                });
            });

            it("should work with findById({}, id, callback) ", function(done) {
                Octocat.findById({}, 2, function(err, model) {
                    expect(err).to.be(null);
                    expect(model.get("name")).to.eql("Octo 2");
                    done();
                });
            });

            it("should work with findById(true, {}, id, callback) ", function(done) {
                Octocat.findById(true, {}, 2, function(err, model) {
                    expect(err).to.be(null);
                    expect(model.get("name")).to.eql("Octo 2");
                    done();
                });
            });

            it("should append the ids to the octocat ", function(done) {
                Octocat.findById({ "group" : 2}, 1, function(err, model) {
                    expect(err).to.be(null);
                    expect(model.get("name")).to.eql("Octo 1");
                    expect(model.getId("group")).to.eql(2);
                    done();
                });
            });
        });

        describe("#find", function () {
            var Model,
                services,
                mockedOctocats;

            describe("on the client", function () {

                before(function () {
                    setEnv(env, "client");
                });

                var testService;

                beforeEach(function () {

                    mockedOctocats = [
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

                    testService = {
                        readCollection : function(remote, ids, params, callback) {
                            callback({ status : "success", data : mockedOctocats });
                        }
                    };

                    services = require("../../lib/shared/registries/serviceRegistry.js");
                    services.getService =  function () {
                        return testService;
                    };
                    Octocat = require("./Model/Octocat.class.js");
                });

                it("should call the static method and run the mocked readCollection-service", function(done) {
                    Octocat.find({},{ da : "ta" }, function(err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should accept remote as first argument", function(done) {
                    Octocat.find(true, {},{ da : "ta" }, function(err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should accept remote as first argument when called with three arguments ", function(done) {
                    Octocat.find(false,{ da : "ta" }, function(err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                it("should accept requests without ids and remote as arguments", function(done) {
                    Octocat.find({ da : "ta" }, function(err, models) {
                        expect(err).to.be(null);
                        expect(models.get(0).get("name")).to.eql("Octo 1");
                        expect(models.get(1).get("name")).to.eql("Octo 2");
                        done();
                    });
                });

                /*
                it("should contact the remote service if no service was defined", function(done) {
                    testService = null;
                    Octocat.find({ da : "ta" }, function(err, models) {

                        //todo implement expects
                        //console.log(err, models);
                        done();
                    });
                });
                */
            });
        });
    });
});


describe("Model-Loader (Model-Caching)", function(){

    var Model;

    var env = require("../../lib/shared/env.js");

    before(function () {
        var modelCache = require("../../lib/shared/modelCache.js"),
            clientModelCache = require("../../lib/client/modelCache.client.js");

        //reMap functions
        modelCache.get = clientModelCache.get;
        modelCache.add = clientModelCache.add;

        Model = require("../../lib/shared/Model.class.js");
    });

    before(function () {
        setEnv(env, "client");
    });

    describe("#find", function () {

        var Octoduck;

        before(function () {
            Octoduck = require("./Model/OctoDuck.class.js");
        });

        it("should return a cached instance", function(done) {
            Octoduck.findById(2, function(err, octo) {
                expect(octo).to.be.an("object");
                octo.set("name", "emil");
                Octoduck.findById(2, function(err, octo2) {
                    expect(octo).to.eql(octo2);
                    expect(octo2.get("name")).to.be("emil");
                    octo2.set("name", "erpel");
                    expect(octo2.get("name")).to.be("erpel");
                    expect(octo.get("name")).to.be("erpel");
                    done();
                });
            });
        });

        it("should not cache instances created with new", function(done) {
            var octo = new Octoduck(24);
            octo.set("name", "old emil");

            Octoduck.findById(24, function(err, octo2) {
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
            Octoduck = require("./Model/OctoDuck.class.js");
        });

        it("should add an instance to the registry after successful saving", function(done) {

            var octo = new Octoduck();

            //id gets set internally after .save
            octo.save(function(err, res) {

                Octoduck.findById(2, function(err, octo2) {
                    expect(octo).to.eql(octo2);
                    done();
                });
            });
        });
    });
});