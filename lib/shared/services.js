var services,
    settings = require('./settings.js'),
    domAdapter = require('./domAdapter.js');

function RemoteServiceWrapper(servicePath) {

    function onRemoteServiceResponse(callback) {
        return function handleResponse(code, rawResponse) {
            var response;

            try {
                response = domAdapter.JSONparse(rawResponse);
            } catch (err) {
                response = rawResponse;
            }
            callback(code, response);
        }
    }

    this.GET = function GET(param, callback) {
        var uri = settings.baseURI + '/' + servicePath;

        if (typeof param === 'object') {
            uri += '?' + domAdapter.QueryStringify(param);
        } else {
            uri += '/' + encodeURIComponent(param);
        }
        domAdapter.request('GET', uri, '', onRemoteServiceResponse(callback));
    };

    this.POST = function POST(model, callback) {
        var uri = settings.baseURI + '/' + servicePath;

        model = domAdapter.JSONstringify(model);
        domAdapter.request('POST', uri, model, onRemoteServiceResponse(callback));
    };

    this.PUT = function PUT(id, model, callback) {
        var uri = settings.baseURI + '/' + servicePath + '/' + encodeURIComponent(id);

        model = domAdapter.JSONstringify(model);
        domAdapter.request('PUT', uri, model, onRemoteServiceResponse(callback));
    };

    this.DELETE = function DELETE(id, callback) {
        var uri = settings.baseURI + '/' + servicePath + '/' + encodeURIComponent(id);

        domAdapter.request('DELETE', uri, '', onRemoteServiceResponse(callback));
    };
}


function getService(path) {
    var servicePath = 'node_modules/services/' + path,
        isServerAvailable = services.server[servicePath + '.server.js'],
        isClientAvailable = services.client[servicePath + '.client.js'];

    if (settings.isClient && isClientAvailable) {
        return require(servicePath + '.client.js');
    } else if (settings.isClient && isServerAvailable) {
        return new RemoteServiceWrapper(servicePath);
    } else if (settings.isServer && isServerAvailable) {
        return require(servicePath + '.server.js');
    } else {
        return null;
    }
}

function getRemoteService(path) {
    var servicePath = 'node_modules/services/' + path,
        isAvailable = services.server[servicePath + '.server.js'];

    if (settings.isClient && isAvailable) {
        return new RemoteServiceWrapper(servicePath);
    } else {
        return null;
    }
}

function setServices(newServices) {
    services = newServices;
}

exports.setServices = setServices;
exports.getService = getService;
exports.getRemoteService = getRemoteService;