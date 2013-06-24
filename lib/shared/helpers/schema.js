"use strict";
//Inspired by the great mongoose-project: https://github.com/LearnBoost/mongoose/blob/master/lib/schema.js

var value = require("value");

var supportedTypes = [
        "String",
        "Number",
        "Boolean",
        "Date",
        "Array",
        "Object"
    ],
    fnName = /function ([a-z]+?)\(/i;

/**
 * determine the type of an object
 * inspired by mongoose
 *
 * @param obj
 * @return {*}
 */
function determineType(obj) {
    var type,
        typeValue,
        name;

    if (value(obj).typeOf(Object)) {
        type = obj.type || "Object";
    } else {
        type = obj;
    }

    typeValue = value(type);

    if (typeValue.typeOf(String)) {
        name = type.charAt(0).toUpperCase() + type.substring(1);

        return supportedTypes.indexOf(name) === -1? "String" : name;
    } else if (typeValue.typeOf(Function)) {
        name = type.toString().match(fnName)[1];
    } else if (typeValue.typeOf(Object)) {
        if (type.type) {
            name = type.type;
        } else {
            return "Object";
        }
    } else {
        name = type.constructor.toString().match(fnName)[1];
    }

    if (supportedTypes.indexOf(name) === -1) {
        throw new TypeError("(alamid) Type '" + name + "' is not supported");
    }

    return name;
}

/**
 * extract keys, types, defaults from the schema object
 *
 * @param {Object} schema
 * @return {Object}
 */
function processSchema(schema) {

    var key,
        fieldDefinition,
        type,
        _keys = [],
        _defaults = {},
        _types = {};

    for (key in schema) {
        if (schema.hasOwnProperty(key)) {

            _keys.push(key);

            fieldDefinition = schema[key];
            //determine supported types
            type = determineType(fieldDefinition);

            _types[key] = type;

            //defaults can be functions
            if (value(fieldDefinition["default"]).typeOf(Function)) {
                _defaults[key] = fieldDefinition["default"]();
            } else {
                //undefined is the default value if nothing else is set
                _defaults[key] = fieldDefinition["default"];
            }
        }
    }

    return {
        keys : _keys,
        defaults : _defaults,
        types : _types
    };
}

exports.processSchema = processSchema;