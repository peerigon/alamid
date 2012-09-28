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
            if(age >= 50) {
                return "tooOld-server";
            }
            return true;
        }
    },
    birthday: Date,
    location : String,
    server : String
};

module.exports = OctocatSchema;