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
                return false;
            }
            return true;
        }
    },
    birthday: Date,
    location : String
};

module.exports = OctocatSchema;