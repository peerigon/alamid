"use strict";

var Collection = require("../../../lib/shared/Collection.class.js");

var DefinedCollectionExample = Collection.define("DefinedCollectionExample", {

    executeDone: function (done) {
        done();
    }

});

module.exports = DefinedCollectionExample;