"use strict"; // run code in ES5 strict mode

var value = require("value");

function collectNodeReferences(obj, collection) {
    var key;

    collection = collection || [];

    if (value(obj).typeOf(Node)) {
        collection.push(obj);
    } else if (value(obj).typeOf(Object) || value(obj).typeOf(Array)) {
        /*jshint forin:false */ // we want 'em all
        for (key in obj) {
            collectNodeReferences(obj[key], collection);
        }
    }

    return collection;
}

module.exports = collectNodeReferences;
