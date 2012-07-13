
//Inspired by the great mongoose-project: https://github.com/LearnBoost/mongoose/blob/master/lib/schema.js

//would be better as an array
var SUPPORTED_TYPES = {
    String : true,
    Number : true,
    Date : true,
    Array : true
};


function determineType(obj) {
    if (obj.constructor.name !== 'Object'){
        obj = { type: obj };
    }

    // Get the type making sure to allow keys named "type"
    // and default to mixed if not specified.
    // { type: { type: String, default: 'freshcut' } }
    var type = obj.type && !obj.type.type
        ? obj.type
        : {};

    if ('Object' === type.constructor.name || 'mixed' === type) {
        throw new TypeError("(alamid) Type 'mixed' is not supported.");
    }

    if (Array.isArray(type) || Array === type || 'array' === type) {
        return "Array";
    }

    var name = 'string' == typeof type
        ? type
        : type.name;

    if (name) {
        name = name.charAt(0).toUpperCase() + name.substring(1);
    }

    if (SUPPORTED_TYPES[name] === undefined) {
        throw new TypeError("(alamid) Type '" + name + "' is not supported");
    }

    return name;
}

exports.determineType = determineType;