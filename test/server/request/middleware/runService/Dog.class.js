"use strict";

var Model = require('../../../../../lib/shared/Model.class.js');

 var DogSchema = {
        name: {
            type: String
        }
    };

var Dog = Model.extend("Dog", {
    url : "dog",
    constructor: function(id) {
        this._super(id);
        this.setSchema(DogSchema, "shared");
        this.setSchema(DogSchema);
    },
    accept: function() {
        this.acceptCurrentState();
    }
});

module.exports = Dog;