//////////////////////////////////////////////////////////////////////////////////
/** Test preperations */

var toSrc = require('../lib/toSrc'),
    assert = require('assert');

function typeOf(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);    // Returns a string like "Object", "Array", "String", ...
}

function checkIdentity(source, copy) {
    var key,
        result;

    if(source === undefined || copy === undefined) {
        return source === copy;
    } else if(typeOf(source) === 'String') {
        return source === copy;
    } else if(typeOf(source) === 'Function') {
        return source.toString() === copy.toString();
    } else if(typeOf(source) === 'Boolean') {
        return source === copy;
    } else if(typeOf(source) === 'Number') {
        return source.toString() === copy.toString();   // .toString() necessary to check for NaN.
    } else if(source === null) {
        return source === copy;
    } else if(typeOf(source) === 'RegExp') {
        return source.toString() === copy.toString();
    } else if(typeOf(source) === 'Date') {
        return source.getTime() === copy.getTime();
    } else if(typeOf(source) === 'Object' || typeOf(source) === 'Array') {
        for(key in source) {
            result = checkIdentity(source[key], copy[key]);
            if(result === false) {
                return false;
            }
        }
        return true;
    }

    return false;
}

var referenceTestObj = {
    "one": "one",
    "two": 2
};

var testObj = {
    "string1": "this is a string",
    "number1": 2,
    "MAX_VALUE": Number.MAX_VALUE,
    "MIN_VALUE": Number.MIN_VALUE,
    "POSITIVE_INFINITY": Number.POSITIVE_INFINITY,
    "NEGATIVE_INFINITY": Number.NEGATIVE_INFINITY,
    "NaN": Number.NaN,
    "MathE": Math.E,
    "MathLN2": Math.LN2,
    "MathLN10": Math.LN10,
    "Math.LOG2E": Math.LOG2E,
    "Math.LOG10E": Math.LOG10E,
    "Math.PI": Math.PI,
    "Math.SQRT1_2": Math.SQRT1_2,
    "Math.SQRT2": Math.SQRT2,
    "boolean1": true,
    "functionTest": function() {
        console.log("hello");
    },
    "array": [1, 2, 3, true, "hello"],
    "complexArray": [
        function() {
            console.log("test");
        },
        {
            "string": "test1",
            "number": 2342
        },
        [
            1,2,3
        ]
    ],
    "regEx1": /dasd/gi,
    "regEx2": new RegExp("dasd"),
    "date": new Date("1955"),
    "nullValue": null,
    "undefinedValue": undefined,
    "emptyObj": {},
    "nestedObj": {
        "hello": function() {
            console.log("hello");
        }
    },
    "referenceTestObj": referenceTestObj
};

//////////////////////////////////////////////////////////////////////////////////
/** Example tests */

assert.equal(toSrc(1), '1');
assert.equal(toSrc(Math.PI), 'Math.PI');
assert.equal(toSrc(true), 'true');
assert.equal(toSrc("1"), '"1"');
assert.equal(toSrc(/regex/gi), '/regex/gi');
assert.ok(
    /new Date\(\d+\)/gi.test(
        toSrc(new Date())
    )
);
assert.equal(toSrc(function() {
    var test = "hello";
}), 'function () {\n    var test = "hello";\n}');
assert.equal(toSrc([1, 2, "3"]), '[1, 2, "3"]');
assert.equal(toSrc({
    "1": 1,
    "regEx": /regex/gi,
    "anotherObj": {
        "test": "test"
    }
}), '{"1": 1, "regEx": /regex/gi, "anotherObj": undefined}');

//////////////////////////////////////////////////////////////////////////////////
/**
 * This test should fail, because the default depth is 1.
 * All nested structures will be undefined
 */

eval('var copy = ' + toSrc(testObj));    // depth = 1
assert.equal(checkIdentity(testObj, copy), false);

//////////////////////////////////////////////////////////////////////////////////
/**
 * This test should also fail because depth=2 is insufficient.
 * complexArray[1] will be undefined.
 */

eval('var copy = ' + toSrc(testObj, 2)); // depth = 2
assert.equal(checkIdentity(testObj, copy), false);

//////////////////////////////////////////////////////////////////////////////////
/**
 * This test should succeed
 */

eval('var copy = ' + toSrc(testObj, 3)); // depth = 3
assert.equal(checkIdentity(testObj, copy), true);

//////////////////////////////////////////////////////////////////////////////////
/**
 * This test should also succeed. An so on...
 */

eval('var copy = ' + toSrc(testObj, 4));
assert.equal(checkIdentity(testObj, copy), true);

//////////////////////////////////////////////////////////////////////////////////
/**
 * This test should fail, because the object contains a circular reference.
 */

testObj.circularRef = testObj
console.log('You should see a warning now...');
eval('var copy = ' + toSrc(testObj, 3));
assert.equal(checkIdentity(testObj, copy), false);




