"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    Event = require("../../lib/shared/Event.class.js");

var expectTypeError = function (err) {
    expect(err).to.be.an(TypeError);
};

describe("Event", function () {
    var event;

    describe(".constructor()", function () {

        it("should return an instance of Event", function () {
            expect(new Event({})).to.be.an(Event);
        });
        it("should throw an error if no valid target has been specified", function () {
            expect(function () { new Event(); }).to.throwError(expectTypeError);
            expect(function () { new Event(null); }).to.throwError(expectTypeError);
        });

    });

    describe(".isDefaultPrevented() / .preventDefault()", function () {

        beforeEach(function () {
            event = new Event({});
        });
        it("isCancelled() should return false by default", function () {
            expect(event.isDefaultPrevented()).to.be(false);
        });
        it("isCancelled() should return true if preventDefault() has been called at least once", function () {
            event.preventDefault();
            expect(event.isDefaultPrevented()).to.be(true);
            event.preventDefault(); // calling it twice doesn't change a thing
            expect(event.isDefaultPrevented()).to.be(true);
        });
        it(".preventDefault() should be chainable", function () {
            expect(event.preventDefault()).to.be(event);
        });

    });
});