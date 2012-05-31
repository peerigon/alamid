var bootstrap = require("./bootstrap.js"),
    connect = require("connect"),
    settings = require("./settings"),
    middleware = require("../server/index.js");

exports.server = null;
exports.middleware = {
    requests: middleware.requests,
    services: middleware.services,
    pages: middleware.pages,
    validators: middleware.validators,
    statics: middleware.statics,
    unhandled: middleware.unhandled
};
exports.start = function (appFolder) {
    bootstrap(appFolder);
    compile();
    serverStart();


    /*middleware.init(exports.server);
    exports.server.listen(settings.port);
    console.log("alamid server listening on port " + settings.port); */
};
