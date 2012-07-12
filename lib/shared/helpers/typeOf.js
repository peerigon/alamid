function typeOf(obj) {
    if (obj === null) {
        return 'Null';
    } else if (obj === undefined) {
        return 'Undefined';
    } else {
        return Object.prototype.toString.call(obj).slice(8, -1); // Returns a string like "Object", "Array", "String", ...
    }
}

module.exports = typeOf;