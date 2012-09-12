"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class,
    NodeClass = nodeclass.Class;

/**
 * Service base-class
 * @type {nodeclass.Class}
 */
var Service = new Class("Service", {
    /**
     * check if a given descriptor is a child class of "Service"
     *
     * @param {Object} descriptor
     * @return {Boolean}
     */
    $extendsService : function(descriptor) {

        while(descriptor !== undefined) {

            if(descriptor.Extends === Service) {
                return true;
            }

            descriptor = descriptor.Extends;
        }

        return false;
    },
    /**
     *
     * @param {String} name
     * @param {!Object} descriptor
     * @return {NodeClass}
     */
    $define : function(name, descriptor) {

        if(descriptor === undefined) {
            descriptor = name;
            name = "AnonymousService";
        }

        if(descriptor.Extends === undefined) {
            descriptor.Extends = Service;
        }
        else {

            if(!Service.extendsService(descriptor)) {
                throw new Error("(alamid) '" + name + "' doesn't extend Service.");
            }
        }

        return new NodeClass(name, descriptor);
    }
});

module.exports = Service;