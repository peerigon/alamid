/**
 * <p><b>MODULE: toSrc</b></p>
 *
 * <p>Converts any object into valid source code.</p>
 *
 * <p>If you dont pass a depth-parameter, all objects within an object or an
 * array are converted to undefined.</p>
 *
 * @version 0.1.0
 */

(function(){             // wrapper to hide vars

// Requirements

// Variables
var knownObjs; // stores all nested structures that have been processed to detect circular references

// Assigning a number to every type, so type-checking will be a bit faster
var typeOfObject = 1,
    typeOfArray = 2,
    typeOfString = 3,
    typeOfNull = 4,
    typeOfUndefined = 5,
    typeOfFunction = 6,
    typeOfBoolean = 7,
    typeOfNumber = 8,
    typeOfRegExp = 9,
    typeOfDate = 10,
    possibleTypes = {
        Object: typeOfObject,
        Array: typeOfArray,
        String: typeOfString,
        Null: typeOfNull,
        Undefined: typeOfUndefined,
        Function: typeOfFunction,
        Boolean: typeOfBoolean,
        Number: typeOfNumber,
        RegExp: typeOfRegExp,
        Date: typeOfDate
    };

/**
 * <p>The only way to check for a type in JavaScript is to compare the
 * result of the internal .toString() method (returns something like [object Array])</p>
 *
 * <p>The type can be something of:
 * <ul>
 * <li>Object</li>
 * <li>Array</li>
 * <li>Date</li>
 * <li>Function</li>
 * <li>RegExp</li>
 * <li>Number</li>
 * <li>Boolean</li>
 * <li>String</li>
 * <li>Null</li>
 * <li>Undefined</li>
 * </ul>
 * The first character of the type must be a capital letter (unlike you may be
 * used to the typeof operator)
 * </p>
 *
 * <p></p>
 *
 * @private
 * @param {Mixed} obj
 * @returns {Boolean} result
 */
function typeOf(obj) {
    if (obj === null) {
        return typeOfNull;
    } else if (obj === undefined) {
        return typeOfUndefined;
    } else {
        return possibleTypes[
            Object.prototype.toString.call(obj).slice(8, -1) // Returns a string like "Object", "Array", "String", ...
        ];
    }
}



/**
 * <p>Converts any object into valid source code.</p>
 *
 * <p>If you dont pass a depth-parameter, it will default to 1. In this case
 * all objects within an object or an array are converted to undefined.</p>
 *
 * @private
 * @param {Mixed} obj
 * @param {Integer} depth
 * @returns {String} source code
 */
function toSrcRecursive(obj, depth) {
    var type = typeOf(obj),
        objString,
        key,
        i, l;

    if (depth === undefined || depth === null) {
        depth = 1;
    }


    // We start with nested structures like Objects or Arrays to make
    // recursion really fast
    if (type === typeOfObject) {
        if(depth > 0) {
            if(knownObjs.indexOf(obj) !== -1) {
                console.log('toSrc warning: Circular reference detected within object ', obj);

                return 'undefined';
            } else {
                knownObjs.push(obj);
            }
            objString = '{';
            for(key in obj) { if(obj.hasOwnProperty(key)) {
                objString += '"' + key + '": ' + toSrcRecursive(obj[key], depth - 1) + ', ';
            }}
            if(objString.length > 1) {
                objString = objString.substring(0, objString.length - 2);
            }
            objString += '}';
        } else {
            objString = 'undefined';
        }

        return objString;
    } else if (type === typeOfArray) {
        if(depth > 0) {
            if(knownObjs.indexOf(obj) !== -1) {
                console.log('toSrc warning: Circular reference detected within array ', obj);
                return 'undefined';
            } else {
                knownObjs.push(obj);
            }
            objString = '[';
            for(i=0, l=obj.length; i<l; i++) {
                objString += toSrcRecursive(obj[i], depth - 1) + ', ';
            }
            if(objString.length > 1) {
                objString = objString.substring(0, objString.length - 2);
            }
            objString += ']';
        } else {
            objString = 'undefined';
        }

        return objString;
    } else if (type === typeOfString) {
        return '"'+ obj + '"';
    } else if (type === typeOfNull) {
        return 'null';
    } else if (type === typeOfUndefined) {
        return 'undefined';
    } else if (type === typeOfFunction) {
        return obj.toString();
    } else if (type === typeOfBoolean) {
        return obj.toString();
    } else if (type === typeOfNumber) {
        if(obj === Number.MAX_VALUE) {
            return 'Number.MAX_VALUE';
        } else if(obj === Number.MIN_VALUE) {
            return 'Number.MIN_VALUE';
        } else if(obj === Math.E) {
            return 'Math.E';
        } else if(obj === Math.LN2) {
            return 'Math.LN2';
        } else if(obj === Math.LN10) {
            return 'Math.LN10';
        } else if(obj === Math.LOG2E) {
            return 'Math.LOG2E';
        } else if(obj === Math.LOG10E) {
            return 'Math.LOG10E';
        } else if(obj === Math.PI) {
            return 'Math.PI';
        } else if(obj === Math.SQRT1_2) {
            return 'Math.SQRT1_2';
        } else if(obj === Math.SQRT2) {
            return 'Math.SQRT2';
        } else {
            return obj.toString();
        }
    } else if (type === typeOfRegExp) {
        return obj.toString();
    } else if (type === typeOfDate) {
        return 'new Date(' + obj.getTime() + ')';
    } else {
        return 'undefined'; // fallback for not supported types like XML
    }
}



/**
 * <p>Converts any object into valid source code.</p>
 *
 * <p>If you dont pass a depth-parameter, it will default to 1. In this case
 * all objects within an object or an array are converted to undefined.</p>
 *
 * <p>Types that can be converted by this module are:
 * <ul>
 * <li>Object</li>
 * <li>Array</li>
 * <li>Date</li>
 * <li>Function</li>
 * <li>RegExp</li>
 * <li>Number</li>
 * <li>Boolean</li>
 * <li>String</li>
 * <li>Null</li>
 * <li>Undefined</li>
 * </ul>
 * </p>
 *
 * @param {Mixed} obj
 * @param {Integer} depth
 * @returns {String} source code
 */
function toSrc(obj, depth) {
    var result;

    knownObjs = []; // resetting the knownObjs
    result = toSrcRecursive(obj, depth);

    return result;
}

if(typeof window !== 'undefined') { // IF TRUE: We're within a browser context
    window.toSrc = toSrc;
} else if(typeof module !== 'undefined'){ // IF TRUE: We're within a commonJS context (like node.js)
    module.exports = toSrc;
}



})();