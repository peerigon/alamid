"use strict";

function ModelCache() {
    this._elements = {};
}

ModelCache.prototype.set = function (key, value) {
    this._elements[key] = value;
};
ModelCache.prototype.get = function (key) {
    return this._elements[key];
};
ModelCache.prototype.remove = function (key) {
    delete this._elements[key];
};

module.exports = ModelCache;