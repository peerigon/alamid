"use strict";

var OctocatSchema = {
    name: {
        type: String,
        required: true,
        validate: function (name, callback) {
            //async test
            if(name === null) {
                callback(false);
                return;
            }
            callback(true);
        }
    },
    age : {
        "type" : Number,
        "required" : false,
        "default" : 5,
        "validate" : function(age) {
            if(age >= 100) {
                return "tooOld-shared";
            }
            return true;
        }
    },
    birthday: Date,
    location : {
        type : String,
        validate : function(location) {
            if(location === "") {
                return false;
            }
            return true;
        }
    },
    shared : String
};

module.exports = OctocatSchema;