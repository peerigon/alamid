var settings = require('alamid/settings.js'),
    domAdapter = require('./domAdapter.js');

var validators;

function RemoteValidatorWrapper(validatorPath) {
    var uri = settings.baseURI + '/' + validatorPath;

    this.validate = function validate(id, model, callback) {
        var param;

        function handleResponse(code, rawResponse) {
            var response;

            if (code === 200) {
                try {
                    response = domAdapter.JSONparse(rawResponse);
                } catch (err) {
                    response = rawResponse;
                }
            } else {
                response = {
                    "result": false,
                    "message": "Unexpected network error."
                };
            }
            callback(response);
        }

        if (id === undefined) {
            id = null;
        }
        param = {
            "id": id,
            "model": model
        };
        param = domAdapter.JSONstringify(param);
        domAdapter.request('POST', uri, param, handleResponse);
    };

}

function getValidators(path) {
    var validatorPath = 'node_modules/validators/' + path,
        isServerAvailable = validators.server[validatorPath + '.server.js'],
        isClientAvailable = validators.client[validatorPath + '.client.js'],
        result = {};

    if (settings.isClient) {
        if (isClientAvailable) {
            result.client = require(validatorPath + '.client.js');
        }
        if (isServerAvailable) {
            result.server = new RemoteValidatorWrapper(validatorPath);
        }
    } else {
        if (isClientAvailable) {
            result.client = require(validatorPath + '.client.js');
        }
        if (isServerAvailable) {
            result.server = require(validatorPath + '.server.js');
        }
    }

    return result;
}

function setValidators(newValidators) {
    validators = newValidators;
}

exports.setValidators = setValidators;
exports.getValidators = getValidators;