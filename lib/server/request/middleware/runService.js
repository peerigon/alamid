var paths = require('../../../helpers/paths.js'),
    settings = require('../../../helpers/config'),
    services = require("../../services.js");


function runService(req, res, next) {
    var parsed = req.parsedURL,
        hasQueryParams = Object.keys(parsed.query).length !== 0,
        service,
        path,
        param;

    function callService(path) {
        service = require(path);
        if (service[req.method]) {
            switch(req.method) {
            case 'GET':
                service.GET(param, onServiceCallback);
                break;
            case 'POST':
                service.POST(req.body, onServiceCallback);
                break;
            case 'PUT':
                service.PUT(param, req.body, onServiceCallback);
                break;
            case 'DELETE':
                service.DELETE(param, onServiceCallback);
                break;
            default:
                onServiceCallFailed();
            }
        } else {
            onServiceCallFailed();
        }
    }

    function onServiceCallFailed() {
        var allowedMethods;

        allowedMethods = service.GET? 'GET, ': '';
        allowedMethods += service.POST? 'POST, ': '';
        allowedMethods += service.PUT? 'PUT, ': '';
        allowedMethods += service.DELETE? 'DELETE, ': '';
        allowedMethods = allowedMethods.substr(0, allowedMethods.length - 2);  // trim off the last comma
        if (allowedMethods === '') {
            res.statusCode = 403;
        } else {
            res.statusCode = 405;
            res.setHeader('Allow', allowedMethods);
        }

        res.end();
    }

    function onServiceCallback(statusCode, result) {
        res.statusCode = statusCode;
        if (result) {
            result = JSON.stringify(result);
        }
        res.end(result);
    }

    if ((/\?.*/i.test(req.url) && req.method === 'GET') ||
            req.method === 'POST') {
        path = paths.appCompiledPath + parsed.pathname;
        param = parsed.query;
    } else {
        path = parsed.pathname.split('/');
        param = path.pop();
        path = paths.appCompiledPath + path.join('/');
    }
    path = path + '.server.js';
    if (settings.isDev) {
        console.log('looking for service ' + path);
    }
    if (services.server[path]) {
        if (settings.isDev) {
            console.log('found... running service');
        }
        callService(path);

        return;
    }
    if (settings.isDev) {
        console.log('no service found');
    }
    next();
}

module.exports = runService;