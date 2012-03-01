var middleware;

exports.init = require('./init');
exports.server = require('connect').createServer();
middleware = require('./middleware');
exports.middleware = {
    requests: middleware.requests,
    services: middleware.services,
    pages: middleware.pages,
    validators: middleware.validators,
    statics: middleware.statics,
    unhandled: middleware.unhandled
};
exports.start = function start() {
    middleware.init(exports.server);
    exports.server.listen(require('./settings').port);
};
