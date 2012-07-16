"use strict";

function checkRequired(val) {
    if(val === undefined || val === null) {
        return "required";
    }
    return true;
}

exports.checkRequired = checkRequired;
