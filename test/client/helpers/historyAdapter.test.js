"use strict";

var expect = require("expect.js"),
    historyAdapter = require("../../../lib/client/helpers/historyAdapter.js");

describe("historyAdapter", function () {

    //@see https://developer.mozilla.org/en-US/docs/DOM/window.history
    it("should provide the same API as specified on MDN", function () {

        expect(history.back).to.be.a(Function);
        expect(history.forward).to.be.a(Function);
        expect(history.go).to.be.a(Function);
        expect(history.pushState).to.be.a(Function);
        expect(history.replaceState).to.be.a(Function);
        expect(typeof history.length).to.equal("number");

    });

});