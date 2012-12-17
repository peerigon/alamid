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
     * @param {Boolean|Function} remote
     * @param {Object} ids
     * @param {Model} model
     * @param {Function} onCreated
     */
    create: function (remote, ids, model, onCreated) {

    },
    /**
     * @param {Boolean|Function} remote
     * @param {Object} ids
     * @param {Function} onRead
     */
    read: function (remote, ids, onRead) {

    },
    /**
     * @param {Boolean|Function} remote
     * @param {Object} ids
     * @param {Object} params
     * @param {Function} onReadCollection
     */
    readCollection: function (remote, ids, params, onReadCollection) {

    },

    /**
     * @param {Boolean|Function} remote
     * @param {Object} ids
     * @param {Model} model
     * @param {Function} onUpdated
     */
    update: function (remote, ids, model, onUpdated) {

    },

    /**
     * @param {Boolean|Function} remote
     * @param {Object} ids
     * @param {Function} onDestroyed
     */
    destroy: function (remote, ids, onDestroyed) {

    }
});

module.exports = <%= name %>Service;