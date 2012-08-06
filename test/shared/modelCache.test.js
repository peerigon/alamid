"use strict";

// @browser ./testHelpers/compileAlamidClient.js
require("./testHelpers/compileAlamid.js");

var clientModelCache = require("../../lib/client/modelCache.client.js");
var serverModelCache = require("../../lib/server/modelCache.server.js");
var Octocat = require("./Model/Octocat.class.js");

var expect = require("expect.js");

describe("ModelCache", function () {

    describe("Client", function() {

        beforeEach(function() {
            clientModelCache.reset();
        });

        describe("#add ", function() {
            it("should accept Model Instances", function() {
                var octo = new Octocat(2);
                octo.set("name", "hugo");
                clientModelCache.add(octo);

                var octo2 = clientModelCache.get(Octocat.url, 2);
                expect(octo2.get("name")).to.be("hugo");
            });

            it("should overwrite existing instances", function() {

                var octo1 = new Octocat(1);
                octo1.set("name", "uno");

                clientModelCache.add(octo1);

                var octo1Ref = clientModelCache.get(Octocat.url, 1);

                expect(octo1Ref.get("name")).to.be("uno");

                var octo2 = new Octocat(1);
                octo2.set("name", "uno due");

                clientModelCache.add(octo2);
                var octo2Ref = clientModelCache.get(Octocat.url, 1);

                expect(octo2Ref.get("name")).to.be("uno due");
                expect(octo1Ref.get("name")).to.be("uno");
            });
        });

        describe("#get", function() {
            it("should return existing instances", function() {
                var octo = new Octocat(2);
                octo.set("name", "hugo");
                clientModelCache.add(octo);
                var octo2 = clientModelCache.get(Octocat.url, 2);
                expect(octo2.get("name")).to.be("hugo");

                octo2.set("name", "frank");

                var octo3 = clientModelCache.get(Octocat.url, 2);
                expect(octo.get("name")).to.be("frank");
                expect(octo2.get("name")).to.be("frank");
                expect(octo3.get("name")).to.be("frank");
            });
        });

        describe("#reset", function() {
            it("should invalidate the cache", function() {
                var octo = new Octocat(2);
                octo.set("name", "hugo");
                clientModelCache.add(octo);
                var loadedOcto = clientModelCache.get(Octocat.url, 2);
                expect(loadedOcto).to.eql(octo);
                clientModelCache.reset();
                var loadedOctoAfterReset = clientModelCache.get(Octocat.url, 2);
                expect(loadedOctoAfterReset).to.be(null);
            });
        });
    });

    /*
     describe("Server", function() {
     it("should not store instances", function() {
     var octo = new Octocat(2);
     octo.set("name", "hugo");
     serverModelLoader.add(octo);

     var octo2 = serverModelLoader.get(Octocat, 2);
     expect(octo2.get("name")).to.be(null);
     });

     });
     */
});