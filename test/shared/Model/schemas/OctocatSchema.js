"use strict";

var OctocatSchema = {
    name: {
        type: String,
        required: true,
        validate: function (name) {
            return true;
        }
    },
    age : {
        type : Number,
        required : false,
        default : 5,
        validate : function(age) {
            if(age >= 100) {
                return false;
            }
            return true;
        }
    },
    location : String
};

module.exports = OctocatSchema;