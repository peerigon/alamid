"use strict";

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

    var castMap = {
        String : {
            Date : function(value) {
                var resDate = new Date(value);
                if(resDate.toString() !== "Invalid Date") {
                    return resDate;
                }
                return null;
            },
            Number : function(value) {
                var num = parseFloat(value);
                if(Number.isNaN(num)){
                    return false;
                }
                return num;
            }
        },
        Number : {
            Date : function(value) {
                //detected float!
                if(value % 1 !== 0) {
                    return null;
                }
                var resDate = new Date();
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

    if(castMap[actualType] !== undefined && castMap[actualType][expectedType] !== undefined) {
        return castMap[actualType][expectedType](value);
    }
    return null;
}

module.exports = caster;