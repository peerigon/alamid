var serveInitPage = require("../../../pages/serveInitPage.js");

function serveInitPageShortcut(req, res, next) {
    if (req.parsedURL.pathname === '/') {
        serveInitPage(req, res, next);
    } else {
        next();
    }
}

module.exports = serveInitPageShortcut;