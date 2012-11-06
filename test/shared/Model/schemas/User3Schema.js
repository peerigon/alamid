"use strict";

var Class = require("nodeclass").Class;

var User3Schema = {
    loginName: {
        type : String,
        validate : function(loginName) {

            if(!loginName) {
                return "required";
            }

            //you also need a password if loginName is set
            if(this.password === undefined) {
                return "password-required";
            }

            return true;
        }
    },
    password: {
        type : String
    },
    email: String
};


module.exports = User3Schema;