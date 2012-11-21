"use strict";

var connect = require("connect"),
    MemoryStore = connect.middleware.session.MemoryStore;

var sessionStore = new MemoryStore(),
    sessionKey = "alamid.sid",
    sessionSecret = "weLovePandas";

exports.store = sessionStore;
exports.key = sessionKey;
exports.secret = sessionSecret;


