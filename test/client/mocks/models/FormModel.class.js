"use strict";

var Model = require('../../../../lib/shared/Model.class.js'),
    schema = require("./schemas/formSchema");

var FormModelABC = Model.define("FormModel", {

    $url : "FormModel",

    init: function() {

        this.Super(__filename, schema);
        this.Super.setSchema(schema);

    }
});

module.exports = FormModelABC;