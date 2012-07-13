"use strict";

var OctocatSchema = {
    name: {
        type: String,
        required: true,
        validate: function (name, model) {
        }
    },
    age : {
        type : Number,
        required : false,
        default : 5
    },
    location : String
};

module.exports = OctocatSchema;