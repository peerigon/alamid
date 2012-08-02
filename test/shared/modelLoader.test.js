"use strict";

// @browser ./testHelpers/compileAlamidClient.js
require("./testHelpers/compileAlamid.js");

var clientModelLoader = require("../../lib/client/modelLoader.client.js");
var serverModelLoader = require("../../lib/server/modelLoader.server.js");
var Octocat = require("./Model/Octocat.class.js");

var expect = require("expect.js");

describe("ModelLoader", function () {

    describe("Client", function() {
        describe("#add ", function() {
            it("should accept Model Instances", function() {
                var octo = new Octocat(2);
                octo.set("name", "hugo");
                clientModelLoader.add(octo);

                var octo2 = clientModelLoader.get(Octocat.url, 2);
                expect(octo2.get("name")).to.be("hugo");
            });
        });

        describe("#get", function() {
            it("should return existing instances", function() {
                var octo = new Octocat(2);
                octo.set("name", "hugo");
                clientModelLoader.add(octo);
                var octo2 = clientModelLoader.get(Octocat.url, 2);
                expect(octo2.get("name")).to.be("hugo");

                octo2.set("name", "frank");

                var octo3 = clientModelLoader.get(Octocat.url, 2);
                expect(octo.get("name")).to.be("frank");
                expect(octo2.get("name")).to.be("frank");
                expect(octo3.get("name")).to.be("frank");
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