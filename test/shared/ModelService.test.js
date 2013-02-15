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

        if (typeof window !== undefined) {
            return;
        }

        var Octocat,
            testService,
            env;

        before(function () {

            Octocat = require("./Model/Octocat.class.js");
            var services = require("../../lib/shared/registries/serviceRegistry.js");
            services.getService = function () {
                return testService;
            };
        });

        describe("#findById", function () {

            beforeEach(function () {
                testService = {
                    read : function (ids, callback) {
                        callback({ status : "success", data : mockedOctocats[ids.octocat - 1] });
                    },
                    readCollection : function (remote, ids, params, callback) {
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