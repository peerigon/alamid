"use strict";

var expect = require("expect.js"),
    is = require("nodeclass").is,
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    ViewCollection = require("../../lib/client/ViewCollection.class.js"),
    ViewCollectionExampleWithTemplate = require("./mocks/ViewCollectionExampleWithTemplate.class.js"),
    View = require("../../lib/client/View.class.js"),
    ViewExampleWithTemplate = require("./mocks/ViewExampleWithTemplate.class.js"),
    ModelCollection = require("../../lib/shared/ModelCollection.class.js");

describe("ViewCollection", function () {

    var ulString,
        ul,
        $ul,
        viewCollection;

    beforeEach(function () {

        ulString = DOMNodeMocks.getUlString();
        ul = DOMNodeMocks.getUl();
        $ul = jQuery(ul);
        viewCollection = new ViewCollectionExampleWithTemplate(ViewExampleWithTemplate);

    });

    describe(".construct()", function () {

        it("should be an DisplayObject", function () {
           expect(is(viewCollection).instanceOf(DisplayObject)).to.be.ok();
        });

        //it("should be possible to construct ")

    });


});

