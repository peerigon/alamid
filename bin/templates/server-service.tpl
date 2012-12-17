"use strict";

var alamid = require("alamid"),
    Service = alamid.Service;

/**
 * <%= name %>
 * @type {*}
 */
var <%= name %>Service = Service.define("<%= name %>Service", {

    /**
     * constructor
     */
    init: function () {

    },
    /**
     * @param {Object} ids
     * @param {Model} model
     * @param {Function} onCreated
     */
    create: function (ids, model, onCreated) {

    },
    /**
     * @param {Object} ids
     * @param {Function} onRead
     */
    read: function (ids, onRead) {

    },
    /**
     * @param {Object} ids
     * @param {Object} params
     * @param {Function} onReadCollection
     */
    readCollection: function (ids, params, onReadCollection) {

    },

    /**
     * @param {Object} ids
     * @param {Model} model
     * @param {Function} onUpdated
     */
    update: function (ids, model, onUpdated) {

    },

    /**
     * @param {Object} ids
     * @param {Function} onDestroyed
     */
    destroy: function (ids, onDestroyed) {

    }
});

module.exports = <%= name %>Service;