"use strict";

var Model = require("../../../../lib/shared/Model.class.js"),
    carSchema = require("./schemas/carSchema.js");

var Car = Model.extend("Car", {
    url: "Car",
    constructor: function() {
        this._super();
        this.setSchema(carSchema);
    }

});

module.exports = Car;