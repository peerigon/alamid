"use strict";

var Class = require("nodeclass").Class,
    Model = require("../../../../lib/shared/Model.class.js"),
    carSchema = require("./schemas/carSchema.js");

var Car = new Class("Car", {

    Extends: Model,

    $url: "Car",

    init: function() {
        this.Super();
        this.Super.setSchema(carSchema);
    }

});

module.exports = Car;