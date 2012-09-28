"use strict";

var OctocatSchema = {
    name: {
        type: String,
        required: true,
        validate: function (name, callback) {
            //async test
            callback(true);
        }
    },
    age : {
        "type" : Number,
        "required" : false,
        "default" : 5,
        "validate" : function(age) {
            if(age >= 80) {
                return "tooOld-client";
            }
            return true;
        }
    },
    location : String,
    client : String
};

module.exports = OctocatSchema;