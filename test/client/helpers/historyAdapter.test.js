"use strict";

var expect = require("expect.js"),
    historyAdapter = require("../../../lib/client/helpers/historyAdapter.js");

describe("historyAdapter", function () {

    //@see https://developer.mozilla.org/en-US/docs/DOM/window.history
    it("should provide the same API as specified on MDN", function () {

        expect(historyAdapter.back).to.be.a(Function);
        expect(historyAdapter.forward).to.be.a(Function);
        expect(historyAdapter.go).to.be.a(Function);
        expect(historyAdapter.pushState).to.be.a(Function);
        expect(historyAdapter.replaceState).to.be.a(Function);
        //@TODO
        //expect(typeof historyAdapter.length).to.equal("number");

    });

});