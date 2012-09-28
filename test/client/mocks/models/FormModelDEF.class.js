"use strict";

var Class = require("nodeclass").Class,
    Model = require('../../../../lib/shared/Model.class.js'),
    schema = require("./schemas/formSchemaDEF.js");

var FormModelDEF = new Model.define("FormModelDEF", {

    $url : "FormModelDEF",

    init: function() {
        this.Super(__filename, schema);
        this.Super.setSchema(schema);
    },

    accept: function() {
        this.Super.acceptCurrentState();
    }
});

module.exports = FormModelDEF;