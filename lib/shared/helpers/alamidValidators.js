"use strict";

function checkRequired(val) {
    if(val === undefined || val === null || val === "") {
        return "required";
    }
    return true;
}

exports.checkRequired = checkRequired;
