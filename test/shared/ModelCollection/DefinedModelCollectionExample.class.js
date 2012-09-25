"use strict";

var ModelCollection = require("../../../lib/shared/ModelCollection.class.js");

var DefinedModelCollectionExample = ModelCollection.define("DefinedModelCollectionExample", {

    executeDone: function (done) {
        done();
    }

});

module.exports = DefinedModelCollectionExample;