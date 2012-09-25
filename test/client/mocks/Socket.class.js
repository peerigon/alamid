"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class;

var Socket = new Class("Socket", {
    Extends: require('../../../lib/shared/EventEmitter.class.js'),
    init : function() {

    }
});

module.exports = Socket;