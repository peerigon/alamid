"use strict";

var _ = require("underscore");

/**
 * walk an object and converts all bool-strings-value to real booleans
 * @param obj
 * @returns {*}
 */
function booleanize(obj) {

    _(obj).forEach(function(value, key) {

        if(typeof(obj[key]) === "object") {
            obj[key] = booleanize(obj[key]);
        }

        //Boolean-String to REAL boolean cast
        if (obj[key] === "true") {
            obj[key] = true;
        }
        else if (obj[key] === "false") {
            obj[key] = false;
        }
    });

    return obj;
}

module.exports = booleanize;