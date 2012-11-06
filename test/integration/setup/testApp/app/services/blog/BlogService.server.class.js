"use strict";

var nodeclass = require("nodeclass"),
    Class = nodeclass.Class;

var BlogService = new Class("BlogService", {
    init : function() {

    },
    create : function(ids, data, callback) {
        data.id = 1;
        console.log("create called");
        callback({ status : "success" });
    },
    read : function(ids, callback) {
        callback({ status : "success", data : { title : "blogpost", txt : "text" } });
    },
    readCollection : function(ids, params, callback) {
        callback({ status : "success", data : [{ title : "blogpost", txt : "text" }] });
    },
    update : function(ids, model, callback) {
        callback({ status : "success", data : {} });
    },
    destroy : function(ids, callback) {
        callback({ status : "success" });
    }
});

module.exports = BlogService;