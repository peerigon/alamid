"use strict"; // run code in ES5 strict mode

var value = require("value");

function collectNodeReferences(obj, collection) {
    var key,
        i;

    collection = collection || [];

    if (value(obj).typeOf(Node)) {
        collection.push(obj);
    } else if (value(obj).typeOf(Array)) {
        for (i = 0; i < obj.length; i++) {
            collectNodeReferences(obj[i], collection);
        }
    } else if (value(obj).typeOf(Object)) {
        /*jshint forin:false */ // we want 'em all
        for (key in obj) {
            collectNodeReferences(obj[key], collection);
        }
    }

    return collection;
}

module.exports = collectNodeReferences;
