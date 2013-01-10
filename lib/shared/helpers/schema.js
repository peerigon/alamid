"use strict";
//Inspired by the great mongoose-project: https://github.com/LearnBoost/mongoose/blob/master/lib/schema.js

var _ = require("underscore"),
    value = require("value");

//would be better as an array
var SUPPORTED_TYPES = {
    String : true,
    Number : true,
    Boolean : true,
    Date : true,
    Array : true,
    Object : true
};

/**
 * determine the type of an object
 * inspired by mongoose
 *
 * @param obj
 * @return {*}
 */
function determineType(obj) {

    if (obj.constructor.name !== 'Object'){
        obj = { type: obj };
    }

    // Get the type making sure to allow keys named "type"
    // and default to mixed if not specified.
    // { type: { type: String, default: 'freshcut' } }
    var type = obj.type && !obj.type.type ? obj.type : {};

    //we accept mixed type, but no embedded models
    if ('Object' === type.constructor.name || 'mixed' === type) {
        return "Object";
    }

    if (_.isArray(type) || Array === type || 'array' === type) {
        return "Array";
    }

    var name = 'string' === typeof type ? type : type.name;

    if (name) {
        name = name.charAt(0).toUpperCase() + name.substring(1);
    }

    if (SUPPORTED_TYPES[name] === undefined) {
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
function processSchema (schema) {

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

            if (fieldDefinition["default"] === undefined) {
                fieldDefinition["default"] = null;
            }

            _types[key] = type;

            //defaults can be functions
            if (value(fieldDefinition["default"]).typeOf(Function)) {
                _defaults[key] = fieldDefinition["default"]();
            } else {
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