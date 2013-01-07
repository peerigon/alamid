"use strict";

var Class = require("alamid-class");

var PushService = new Class("PushService", {
    update : function(model, callback) {
        callback({ status : "success", data : { name : "pusher"} });
    }
});

module.exports = PushService;

