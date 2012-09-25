"use strict";

var Class = require("nodeclass").Class;
var Model = require('../../../../../lib/shared/Model.class.js');

 var DogSchema = {
        name: {
            type: String
        }
    };

var Dog = Model.define("Dog", {
    $url : "dog",
    "init": function(id) {
        this.Super(id);
        this.Super.setSchema(DogSchema, "shared");
        this.Super.setSchema(DogSchema);
    },
    "accept": function() {
        this.Super.acceptCurrentState();
    }
});

module.exports = Dog;