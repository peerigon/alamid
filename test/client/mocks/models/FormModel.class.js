"use strict";

var Model = require('../../../../lib/shared/Model.class.js'),
    schema = require("./schemas/formSchema");

var FormModelABC = Model.extend("FormModel", {

    url : "FormModel",

    constructor: function() {
        this._super(__filename, schema);
        this.setSchema(schema);
    }
});

module.exports = FormModelABC;