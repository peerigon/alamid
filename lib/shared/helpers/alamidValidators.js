"use strict";

function checkRequired(val) {
    if(val === undefined || val === null || val === "") {
        return "required";
    }
    return true;
}

/**
 * check if enumValue contain val
 * @param {String} val
 * @param {Array} enumValues
 * @return {Boolean}
 */
function checkEnum(val, enumValues) {
    return (enumValues.indexOf(val) !== -1);
}

/**
 * check if value if greater than minValue
 * @param {Number} val
 * @param {Number} minValue
 * @return {Boolean}
 */
function checkMin(val, minValue) {
    if(typeof val !== "number") {
        return false;
    }
    return val >= minValue;
}

/**
 * check if value if lower than maxValue
 * @param {Number} val
 * @param {Number} maxValue
 * @return {Boolean}
 */
function checkMax(val, maxValue) {
    if(typeof val !== "number") {
        return false;
    }
    return val <= maxValue;
}


exports.checkRequired = checkRequired;
exports.checkMin = checkMin;
exports.checkMax = checkMax;
exports.checkEnum = checkEnum;
