"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class;

var PushService = new Class("PushService", {
    init : function() {

    },
    update : function(model, callback) {
        callback({ status : "success", data : { name : "pusher"} });
    }
});

module.exports = PushService;

