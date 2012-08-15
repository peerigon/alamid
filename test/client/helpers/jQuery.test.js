"use strict";

var expect = require("expect.js"),
    jQuery = require("../../../lib/client/helpers/jQuery.js");

describe("jQuery", function () {

    it("should be the jQuery JavaScript library", function () {
        expect(jQuery.expando.search(/alamidjQuery/)).to.equal(0);
    });

    it("should not be attached to the window object", function () {
        expect(jQuery).to.not.equal(window.jQuery);
    });

});