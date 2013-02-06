"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    Event = require("../../lib/shared/Event.class.js");

var expectTypeError = function (err) {
    expect(err).to.be.an(TypeError);
};

describe("Event", function () {
    describe("constructor", function () {
        it("should return an instance of Event", function () {
            expect(new Event({})).to.be.an(Event);
        });
        it("should throw an error if no valid target has been specified", function () {
            expect(function () { new Event(); }).to.throwError(expectTypeError);
            expect(function () { new Event(null); }).to.throwError(expectTypeError);
        });
    });
});