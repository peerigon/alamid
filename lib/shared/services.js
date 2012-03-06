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

function resolve(path) {
    var modelPathPattern = /.*node_modules\/models\/(.*)\.class\.js$/gi,
        serviceName;

    if (modelPathPattern.test(path)) {
        path = path.replace(modelPathPattern, '$1');
        path = path.split('/');
        serviceName = path.pop();
        serviceName = serviceName.charAt(0).toLowerCase() + serviceName.substr(1);
        path.push(serviceName);
        path = path.join('/');
    } else if (path.charAt(0) === '/') {
        path = path.substr(1);
    }

    return path;
}

function getService(path) {
    var servicePath = 'services/' + resolve(path),
        isServerAvailable = services.server['node_modules/' + servicePath + '.server.js'],
        isClientAvailable = services.client['node_modules/' + servicePath + '.client.js'];

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
    var servicePath = 'services/' + resolve(path),
        isAvailable = services.server['node_modules/' + servicePath + '.server.js'];

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