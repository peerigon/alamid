"use strict";

var _ = require("underscore");

var castMap = {
    String : {
        Date : function(value) {
            var resDate = new Date(Date.parse(value));

            if (resDate.toString() !== "Invalid Date") {
                return resDate;
            }
            return null;
        },
        Number : function(value) {
            var num = parseFloat(value);

            if (_.isNaN(num)){
                return false;
            }
            return num;
        }
    },
    Number : {
        Date : function(value) {
            var resDate = new Date();

            //detected float!
            if (value % 1 !== 0) {
                return null;
            }

            resDate.setTime(value);
            return resDate;
        },
        String : function(value) {
            return String(value);
        }
    },
    Date : {
        String : function(value) {
            return String(value);
        },
        Number : function(value) {
            return value.getTime();
        }
    }
};

/**
 * Cast value from actualType to expectedType
 *
 * @param value
 * @param actualType
 * @param expectedType
 * @return {*}
 * @private
 */
function caster(value, actualType, expectedType) {

    if (castMap[actualType] !== undefined && castMap[actualType][expectedType] !== undefined) {
        return castMap[actualType][expectedType](value);
    }
    return null;
}

module.exports = caster;