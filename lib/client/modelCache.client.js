"use strict";

var models = {};

function get(url, id) {
    if(models[url] !== undefined && models[url][id] !== undefined) {
        return models[url][id];
    }
    return null;
}

function add(modelInstance) {
    var url = modelInstance.getUrl(),
        id = modelInstance.getId();

    if(models[url] === undefined) {
        models[url] = {};
    }

    models[url][id] = modelInstance;
}

function reset() {
    models = {};
}

exports.add = add;
exports.get = get;
exports.reset = reset;