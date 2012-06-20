var expect = require("expect.js"),
    domAdapter = require("../lib/client/domAdapter.js");

describe("domAdapter", function () {

    describe("request", function () {

        it("should export a function called request", function () {
            expect(domAdapter.request).to.be.a(Function);
        });

    });

    describe("find", function () {

        it("should export a function called find", function () {
            expect(domAdapter.find).to.be.a(Function);
        });

    });

    describe("findNodes", function () {

        it("should export a function called findNodes", function () {
            expect(domAdapter.findNodes).to.be.a(Function);
        });

    });

    describe("on", function () {

        it("should export a function called on", function () {
            expect(domAdapter.on).to.be.a(Function);
        });

    });

    describe("off", function () {

        it("should export a function called off", function () {
            expect(domAdapter.off).to.be.a(Function);
        });

    });

    describe("addClass", function () {

        it("should export a function called addClass", function () {
            expect(domAdapter.addClass).to.be.a(Function);
        });

    });

    describe("removeClass", function () {

        it("should export a function called removeClass", function () {
            expect(domAdapter.removeClass).to.be.a(Function);
        });

    });

    describe("hasClass", function () {

        it("should export a function called hasClass", function () {
            expect(domAdapter.hasClass).to.be.a(Function);
        });

    });

    describe("destroy", function () {

        it("should export a function called destroy", function () {
            expect(domAdapter.destroy).to.be.a(Function);
        });

    });

    describe("dispose", function () {

        it("should export a function called dispose", function () {
            expect(domAdapter.dispose).to.be.a(Function);
        });

    });

    describe("dispose", function () {

        it("should export a function called dispose", function () {
            expect(domAdapter.dispose).to.be.a(Function);
        });

    });

    describe("stringifyJSON", function () {

        it("should export a function called stringifyJSON", function () {
            expect(domAdapter.stringifyJSON).to.be.a(Function);
        });

    });

    describe("parseJSON", function () {

        it("should export a function called parseJSON", function () {
            expect(domAdapter.parseJSON).to.be.a(Function);
        });

    });

    describe("stringifyQuery", function () {

        it("should export a function called stringifyQuery", function () {
            expect(domAdapter.stringifyQuery).to.be.a(Function);
        });

    });

    describe("stringifyQuery", function () {

        it("should export a function called stringifyQuery", function () {
            expect(domAdapter.stringifyQuery).to.be.a(Function);
        });

    });

    describe("parseQuery", function () {

        var queryObject = { "this": 1, "a": 2, "uint": 3, "test": 4 },
            queryString = domAdapter.stringifyQuery(queryObject);

        it("should export a function called parseQuery", function () {
            expect(domAdapter.parseQuery).to.be.a(Function);
        });

        it("should return an eql object", function () {
            expect(domAdapter.parseQuery(queryString)).to.be.eql(queryObject);
        });

    });



});