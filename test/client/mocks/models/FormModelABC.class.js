"use strict";

var Class = require("nodeclass").Class,
    Model = require('../../../../lib/shared/Model.class.js'),
    schema = require("./schemas/formSchemaABC.js");

var FormModelABC = Model.define("FormModelABC", {

    $url : "FormModelABC",

    init: function() {
        this.Super(__filename, schema);
        this.Super.setSchema(schema);
    },

    accept: function() {
        this.Super.acceptCurrentState();
    }
});

module.exports = FormModelABC;