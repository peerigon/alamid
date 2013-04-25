"use strict";

var getResourceUrl = require("../shared/helpers/getResourceUrl.js");

var models = {};

function get(url, ids) {
    return models[getResourceUrl(url, ids)] || null;
}

function add(modelInstance) {
    var resourceUrl = getResourceUrl(modelInstance.getUrl(), modelInstance.getIds());

    models[resourceUrl] = modelInstance;
}

function reset() {
    models = {};
}

exports.add = add;
exports.get = get;
exports.reset = reset;