"use strict";

var serveInitPage = require("./serveInitPage.js");

function serveInitPageShortcut(req, res, next) {
    if (req.parsedURL.pathname === '/') {
        serveInitPage(req, res, next);
    } else {
        next();
    }
}

module.exports = serveInitPageShortcut;