toSrc
========

This node.js module turns every JavaScript object or primitive into valid source
code. Useful to serialize classes, modules or other programming objects
and reuse them in another environment such as a browser, since JSON.stringify
doesnt convert functions, dates or RegEx.

Note:

* Unless you provide another depth parameter this module turns every nested structure within the given object into undefined.
* Circular references will be undefined. No error is thrown, but a warning is logged.
* All math constants are restored, e.g.: toSrc(Math.PI) // = 'Math.PI'
* All dates are restored to their original time of creation, e.g.: toSrc(new Date()) // = 'new Date( ... time of creation in ms ... )'

Feel free to modify the code to meet your needs.

Usage
-----
The module returns a single function accepting these parameters:

* obj: The object to stringify. Can be a primitive, too.
* depth (optional): Specify the depth to go. All nested structures like objects or arrays deeper than this will be undefined. Defaults to 1.

Examples
-----

    var toSrc = require('toSrc');

    toSrc(1); // = '1'
    toSrc(Math.PI); // = 'Math.PI'
    toSrc(true); // = 'true'
    toSrc("1"); // = '"1"'
    toSrc(/regex/gi); // = '/regex/gi'
    toSrc(new Date()); // = 'new Date( ... the time of creation in ms ... )'
    toSrc(function() {
        var test = "hello";
    }); /* = 'function () {
                 var test = "hello";
             }' */
    toSrc([1, 2, "3"]); // = '[1, 2, "3"]'
    toSrc({
        "1": 1,
        "regEx": /regex/gi,
        "anotherObj": {
            "test": "test"
        }
    }); /* = '{"1": 1, "regEx": /regex/gi, "anotherObj": undefined}'  --> anotherObj is undefined because the depth is 1.