"use strict";

var Class = require("nodeclass").Class,
    Collection = require("../../../lib/shared/Collection.class.js");

var CollectionExample = new Class({

    Extends: Collection,

    /**
     * Exposes the collections elements.
     * Use this function to test for example .push() or .set() independently of any other function like .get().
     *
     * @return {array}
     */
    getElements: function () {
        return this.Super._getElements();
    }

});

module.exports = CollectionExample;

