"use strict";

var Class = require("alamid-class");

var BlogService = new Class("BlogService", {
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