"use strict";

var expect = require("expect.js"),
    AlamidjQuery = require("../../../lib/client/helpers/jQuery.js");

describe("jQuery", function () {

    it("should be jQuery JavaScript library", function () {
        expect(AlamidjQuery.expando.search(/alamidjQuery/)).to.equal(0);
    });

    it("should not be attached to the window object", function () {
        expect(AlamidjQuery).to.not.equal(window.jQuery);
    });

});