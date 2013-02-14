"use strict";

var expect = require("expect.js"),
    AlamidjQuery = require("../../../lib/client/helpers/jQuery.js");

describe("jQuery", function () {

    it("should not be attached to the window object", function () {
        expect(AlamidjQuery).to.not.equal(window.jQuery);
    });

});