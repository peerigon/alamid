var url = require('url'),
    util = require('util');

var counter = 1;

function handler (req, res, next) {
    var id = counter++,
        _end = res.end,
        urlParsed = url.parse(req.url, true);

    res.end = function wrapper() {
        _end.apply(res, arguments);
        console.log('response code: ' + res.statusCode);
        console.timeEnd('Request ' + id + ' took');
        console.log('=== REQUEST END ' + id + ' ======================================================');
    };
    console.time('Request ' + id + ' took');
    console.log('=== REQUEST ' + id + ' ==========================================================');
    console.log(req.method, req.url);
    if (req.headers['x-requested-with'] === 'XMLHttpRequest' || /[\?\&](ajax$|ajax&)/i.test(req.url)) {
        console.log('via Ajax');
    }
    console.log('');
    console.log('pathname: ' + urlParsed.pathname);
    console.log('params: ' + util.inspect(urlParsed.query));
    next();
}

function logger() {
    if (settings.isDev) {
        console.log.apply(console, arguments);
    }
}

exports.handler = handler;
exports.logger = logger;