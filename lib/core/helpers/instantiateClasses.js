"use strict";

var _ = require("underscore");

/**
 * Creates instances for each item
 * @param {Object} classes
 * @return {Object}
 */
function instantiateClasses(classes) {
    _.each(classes, function(Class, identifier) {
        classes[identifier] = new Class();
    });
    return classes;
}

module.exports = instantiateClasses;