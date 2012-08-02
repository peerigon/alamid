"use strict";

var carSchema = {

    "manufactor": {
        "type": String,
        require: true
    },

    "model": {
        "type": String,
        require:true
    },

    //year of construction
    "yoc": {
        type: Date,
        require: true
    }
};

module.exports = carSchema;