"use strict";


var expect = require("expect.js"),
    Octocat = require("../shared/Model/Octocat.class.js");

var sharedModelServiceTest = require("../shared/ModelService.test.js");

describe("Model-Services", function () {

    //#Shared
    sharedModelServiceTest();


    describe("#Server", function() {

        var testService,
            octocat;

        beforeEach(function() {
            testService = {};
            octocat = new Octocat();
            octocat.setService(testService);
        });

        describe("sync & async", function () {

            function syncCreate(ids, model) {
                return { status : "success", data : { id : 1 }};
            }

            function asyncCreate(ids, model, callback) {
                callback({ status : "success", data : { id : 1 }});
            }

            function callCreateService(done) {

                octocat.set('name', 'Octocat');
                expect(octocat.getId()).to.be(null);

                octocat.save(function (err) {
                    expect(err).to.be(null);
                    expect(octocat.getId()).to.be(1);
                    done();
                });
            }

            it("should work with sync services", function (done) {

                testService.create = syncCreate;
                callCreateService(done);
            });

            it("should work with async services", function (done) {

                testService.create = asyncCreate;
                callCreateService(done);
            });
        });

        describe("#Statics", function() {

            describe("#find", function() {

                var Octocat,
                    testService,
                    services;

                before(function () {

                    services = require("../../lib/shared/registries/serviceRegistry.js");
                    services.getService = function () {
                        return testService;
                    };

                    Octocat = require("../shared/Model/Octocat.class.js");
                });

                beforeEach(function() {
                    testService = {};
                });

                //works only here because it would fall back to RemoteService on client
                //so this is no shared test
                it("should fail if no server service is defined", function (done) {

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