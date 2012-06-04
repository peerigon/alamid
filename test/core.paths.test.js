"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    paths = require("../lib/core/paths.js"),
    filters = paths.filters;

describe("paths", function () {

    describe("#filters", function () {

        describe("##noClasses", function(){

            it("should filter all files expect class files", function () {
                expect(filters.noClasses("fileName.class.js")).to.be(false);
                expect(filters.noClasses("fileName.js")).to.be(true);
                expect(filters.noClasses("fileName.server.class.js")).to.be(false);
            });
        });

        describe("##onlyClasses", function(){

            it("should filter only class files", function () {
                expect(filters.onlyClasses("fileName.class.js")).to.be(true);
                expect(filters.onlyClasses("fileName.js")).to.be(false);
                expect(filters.onlyClasses("fileName.server.class.js")).to.be(true);
            });
        });

        describe("##noAlamidFiles", function(){

            it("should only return files, that don't contain to alamid", function () {
                expect(filters.noAlamidFiles("node_modules/alamid/fileName.js")).to.be(false);
                expect(filters.noAlamidFiles("fileName.js")).to.be(true);
                expect(filters.noAlamidFiles("/alamid/fileName.server.class.js")).to.be(true);
            });
        });

        describe("##noServerFiles", function(){
            it("should return everything except server-files", function () {
                expect(filters.noServerFiles("node_modules/alamid/fileName.server.js")).to.be(false);
                expect(filters.noServerFiles("fileName.js")).to.be(true);
                expect(filters.noServerFiles("/alamid/fileName.client.class.js")).to.be(true);
            });
        });

        describe("##onlyServerFiles", function(){
            it("should return only server-files", function () {
                expect(filters.onlyServerFiles("node_modules/alamid/fileName.server.js")).to.be(true);
                expect(filters.onlyServerFiles("fileName.js")).to.be(false);
                expect(filters.onlyServerFiles("/alamid/fileName.client.class.js")).to.be(false);
            });
        });

        describe("##onlyClientFiles", function(){
            it("should return only client-files", function () {
                expect(filters.onlyClientFiles("node_modules/alamid/fileName.server.js")).to.be(false);
                expect(filters.onlyClientFiles("fileName.js")).to.be(false);
                expect(filters.onlyClientFiles("/alamid/fileName.client.class.js")).to.be(true);
            });
        });

        describe("##noClientFiles", function(){
            it("should return everything except client-files", function () {
                expect(filters.noClientFiles("node_modules/alamid/fileName.server.js")).to.be(true);
                expect(filters.noClientFiles("fileName.js")).to.be(true);
                expect(filters.noClientFiles("/alamid/fileName.client.class.js")).to.be(false);
            });
        });
    });


});