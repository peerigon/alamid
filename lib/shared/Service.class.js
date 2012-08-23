"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class,
    NodeClass = nodeclass.Class;

/**
 * Service base-class
 * @type {nodeclass.Class}
 */
var Service = new Class({
    $define : function(descriptor) {
        descriptor.Extends = Service;
        return new NodeClass(descriptor);
    }
});

module.exports = Service;