"use strict";

var connect = require("connect"),
    MemoryStore = connect.middleware.session.MemoryStore;

module.exports = {
    store : new MemoryStore(),
    key : "alamid.sid",
    secret : "weLovePandas"
};