"use strict";

var Class = require("nodeclass").Class,
    Comment = require("Comment.class.js");

var CommentService = new Class({
    __saveWithId : function(remoteCommentInstance) {
      //...
    },
    init : function () {
        //nothing to do here
        Comment.on("remoteCreate", this.__saveWithId);
        Comment.on("remoteUpdate", function(event) {

            var model = event.model;
            model.set(event.data);

            model.save(false, function(err) {});

        });
    },
    create : function(remote, ids, model, callback){
        callback({ "status" : "success" });
    },
    read : function(remote, ids, callback){
        callback({ "status" : "success", data : { da : "ta" }});
    },
    readCollection : function(remote, ids, params, callback){
        callback({ "status" : "success", "data" : { "readCollection" : true }});
    },
    update : function(remote, ids, model, callback){
        callback({ status : "success", data : { da : "ta" }});
    },
    delete : function(remote, useServerService, ids, callback) {
        callback({ status : "success" });
    }
});

module.exports = CommentService;


