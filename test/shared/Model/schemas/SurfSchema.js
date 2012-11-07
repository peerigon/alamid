"use strict";

var SurfSchema = {
    name: {
        type: String,
        validate : function validateName(name) {

            //no names shorten than 5 chars
            return name.length >= 5;
        }
    },
    fun : {
        type : String,
        validate : function validateFun(fun, callback) {

            //surf can only be fun
            if(fun) {
                callback(true);
                return;
            }

            callback(false);
        }
    }
};

module.exports = SurfSchema;