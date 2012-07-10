"use strict";

var connect = require("connect"),
    MemoryStore = connect.middleware.session.MemoryStore,
    store;

function getConnectSessionObject() {
    return {
        secret: 'secret',
        key: 'alamid.sid',
        store: getSessionStore()
    };
}

function getSessionStore() {

    if(store === undefined) {
        store = new MemoryStore();
    }

    return store;
}



exports.connectSession = getConnectSessionObject();
exports.sessionStore = getSessionStore();