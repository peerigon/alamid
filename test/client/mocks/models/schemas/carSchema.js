"use strict";

var carSchema = {

    "manufactor": {
        "type": String,
        "required": true
    },

    "model": {
        "type": String,
        "required":true
    },

    //year of construction
    "yoc": {
        type: Date,
        "required": true
    }
};

module.exports = carSchema;