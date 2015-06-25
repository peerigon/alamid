"use strict";

var connect = require("connect");
var expressSession = require("express-session");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

function defaultHttServer() {

    var app = connect();

    app.session = {
        store: new expressSession.MemoryStore(),
        secret: "weLovePandas",
        key: "peerigon.sid",
        cookieParser: cookieParser("secret"),
        saveUninitialized: true,
        resave: true
    };

    app.use(bodyParser.json());
    app.use(app.session.cookieParser);
    app.use(expressSession(app.session));

    return app;
}

module.exports = defaultHttServer;