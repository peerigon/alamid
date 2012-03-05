var typeOf = require('./typeOf.js'),
    servicesAdapter = require('misc/servicesAdapter.js');

var acceptedFunctions = [Number, String, Boolean, Date, Array, Object],
    acceptedFunctionsLiteral = ['Number', 'String', 'Boolean', 'Date', 'Array', 'Object'];

function noop() {}

function getFunctionName(func) {
    var name;

    if (func.name === undefined) {
        name = func.toString();
        name = name.substr('function '.length + 1);
        name = name.match(/^[^\(]*/)[0];
    } else {
        name = func.name;
    }

    return name;
}

var Extends = require('./EventEmitter.class.js');
var Class = {
    "init": function init(id) {
        this._id = id;
        this.Super();
    },
    "__init": function __init() {   // used by the init function and removeAll since they act similarly
        function Attributes() {}
        function Changed() {}

        Attributes.prototype = this.__defaults;
        this.__attributes = Changed.prototype = new Attributes();
        this.__changed = new Changed();
    },
    "__keys": null,
    "__defaults": null,
    "__attributes": null,
    "__changed": null,
    "_casting": false,
    "_service": null,
    "_validators": null,
    "_id": null,
    "muted": false,
    "getId": function () {
        return this._id;
    },
    "_setDefaults": function (defaults) {
        var key;

        this.__keys = [];
        for (key in defaults) {
            if (typeof key === 'object'
                || (typeof key === 'function'
                    && acceptedFunctions.indexOf(key) === -1)
                ) {
                throw new TypeError('A model can only contain native types.'
                    + '\nIf you want to save a reference, you should store the ID');
            }
            this.__keys.push(key);
        }
        this.__defaults = defaults;
        this.__init();
    },
    "set": function set(key, value) {
        var map,
            self = this;

        function doSet(key, value) {
            var castingFunc,
                defaultValue,
                expectedType,
                actualType;

            if (self.__keys.indexOf(key) === -1) {
                throw new Error('Unknown property ' + key);
            }
            if (value === null || value === undefined) {
                value = null;
            } else if (self._casting) {
                defaultValue = self.__defaults[key];
                if (defaultValue) {
                    expectedType = typeOf(defaultValue);
                    actualType = typeOf(value);
                    if (expectedType === 'Function') {
                        expectedType = getFunctionName(defaultValue);
                    }
                    if (actualType !== expectedType) {
                        castingFunc = acceptedFunctionsLiteral.indexOf(expectedType);
                        castingFunc = acceptedFunctions[castingFunc];
                        if (castingFunc === Date) {
                            value = new castingFunc(Number(value));
                        } else {
                            value = castingFunc(value);
                        }
                    }
                }
            }
            self.__changed[key] = value;
        }

        if (arguments.length === 1 && typeof key === 'object') {
            map = key;
            for (key in map) {if(map.hasOwnProperty(key)) {
                doSet(key, map[key]);
            }}
        } else {
            doSet(key, value);
        }

        if (!this.muted) {
            this.Super.emit('change');
        }
    },
    "get": function get(key) {
        var result,
            i, l;

        function checkSingleResult(result) {
            if (typeof result === 'function') { // IF TRUE: Its a constructor function, thus a default value
                result = null;
            }

            return result;
        }

        if (arguments.length === 0) {
            arguments = this.__keys;
        }
        if (arguments.length === 1) {
            result = this.__changed[key];
            result = checkSingleResult(result);
        } else {
            result = {};
            for (i = 0, l = arguments.length; i < l; i++) {
                key = arguments[i];
                result[key] = checkSingleResult(this.__changed[key]);
            }
        }

        return result;
    },
    "escape": function escape(key) {
        var result,
            i, l;

        function doEscape(value) {
            if (value === undefined || value === null) {
                return '';
            } else if (typeof value === 'function') { // IF TRUE: Its a constructor function, thus a default value
                return '';
            } else if (value instanceof Date) {
                return String(value.getTime());
            }

            value = String(value); // cast to string

            // These replace patterns are taken from the great Backbone.js
            // project. Please check out: http://documentcloud.github.com/backbone/
            return value.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/\//g,'&#47;');
        }

        if (arguments.length === 0) {
            arguments = this.__keys;
        }
        if (arguments.length === 1) {
            result = doEscape(this.__changed[key]);
        } else {
            result = {};
            for (i = 0, l = arguments.length; i < l; i++) {
                key = arguments[i];
                result[key] = doEscape(this.__changed[key]);
            }
        }

        return result;
    },
    "remove": function remove(key) {
        var i, l;

        for (i = 0, l = arguments.length; i < l; i++) {
            key = arguments[i];
            delete this.__changed[key];
            delete this.__attributes[key];
        }
        if (!this.muted) {
            this.Super.emit('change');
        }
    },
    "removeAll": function removeAll() {
        this.__init();
        if (!this.muted) {
            this.Super.emit('change');
        }
    },
    "unset": function unset(key) {
        var i, l;

        for (i = 0, l = arguments.length; i < l; i++) {
            key = arguments[i];
            delete this.__changed[key];
        }
        if (!this.muted) {
            this.Super.emit('change');
        }
    },
    "unsetAll": function unsetAll() {
        var key,
            changed = this.__changed;

        for (key in changed) { if (changed.hasOwnProperty(key)) {
            delete changed[key];
        }}
        if (!this.muted) {
            this.Super.emit('change');
        }
    },
    "hasChanged": function hasChanged(key) {
        var result = false,
            strict = false,
            changed = this.__changed,
            attributes = this.__attributes,
            argsLength = arguments.length,
            arr,
            checkFunc,
            i, l;

        function doNormalCheck() {
            return changed[key] !== attributes[key];
        }

        function doStrictCheck() {
            return changed.hasOwnProperty(key);
        }

        if (argsLength === 0) {
            arr = this.__keys;
        } else if(argsLength === 1 && typeof key === 'boolean') {
            strict = true;
            arr = this.__keys;
        } else {
            if (typeof arguments[argsLength - 1] === 'boolean') {
                strict = arguments[argsLength - 1];
                arr = Array.prototype.slice.call(arguments, 0, -1);
            }
            arr = arguments;
        }
        if (strict) {
            checkFunc = doStrictCheck;
        } else {
            checkFunc = doNormalCheck;
        }
        for (i = 0, l = arr.length; i < l; i++) {
            key = arr[i];
            result = checkFunc();
            if (result) {
                break;
            }
        }

        return result;
    },
    "isDefault": function isDefault(key) {
        var result = false,
            strict = false,
            changed = this.__changed,
            attributes = this.__attributes,
            defaults = this.__defaults,
            argsLength = arguments.length,
            arr,
            checkFunc,
            i, l;

        function doNormalCheck() {
            return changed[key] === defaults[key];
        }

        function doStrictCheck() {
            return !changed.hasOwnProperty(key)
                && !attributes.hasOwnProperty(key);
        }

        if (argsLength === 0) {
            arr = this.__keys;
        } else if(argsLength === 1 && typeof key === 'boolean') {
            strict = true;
            arr = this.__keys;
        } else {
            if (typeof arguments[argsLength - 1] === 'boolean') {
                strict = arguments[argsLength - 1];
                arr = Array.prototype.slice.call(arguments, 0, -1);
            }
            arr = arguments;
        }
        if (strict) {
            checkFunc = doStrictCheck;
        } else {
            checkFunc = doNormalCheck;
        }
        for (i = 0, l = arr.length; i < l; i++) {
            key = arr[i];
            result = checkFunc();
            if (!result) {
                break;
            }
        }

        return result;
    },
    "getDefaults": function getDefaults() {
        return this.__defaults;
    },
    "toJSON": function toJSON() {
        var keys = this.__keys,
            key,
            result = {},
            i, l;

        function doEscape(value) {
            if (value === undefined || value === null) {
                return null;
            } else if (typeof value === 'function') { // IF TRUE: Its a constructor function, thus a default value
                return null;
            } else if (value instanceof Date) {
                return value.getTime();
            } else {
                return value;
            }
        }

        for (i = 0, l = keys.length; i < l; i++) {
            key = keys[i];
            result[key] = doEscape(this.__changed[key]);
        }

        return result;
    },
    "validate": function validate(clientOnly, callback) {
        var validators = this._validators,
            type,
            i = 0,
            self = this,
            finalResult = {
                "result": false
            };

        function finish() {
            finalResult.result = finalResult.client.result;
            if (finalResult.result === true && !clientOnly) {
                finalResult.result = finalResult.server.result === true;
            }
            if (!self.muted) {
               self.Super.emit('validate', finalResult);
            }
            callback(finalResult);
        }

        function onValidationResult(result) {
            finalResult[type] = result;
            if (result.result === true) {
                doValidation();
            } else {
                finish();
            }
        }

        function doValidation() {
            if (i === 0) {
                type = 'client';
            } else if (i === 1 && !clientOnly) {
                type = 'server';
            } else {
                finish();

                return;
            }
            i++;
            validators[type].validate(self.id, self.toJSON(), onValidationResult);
        }

        if (!validators || (clientOnly && !validators.client) ||
                (!validators.client && !validators.server)) {
            throw new Error('Cannot validate: There is no validator available.');
        }
        if (typeof clientOnly === 'function') {
            callback = clientOnly;
            clientOnly = undefined;
        }
        if (clientOnly === undefined) {
            clientOnly = false;
        }
        if (callback === undefined) {
            callback = noop;
        }
        doValidation();
    },
    "fetch": function fetch(callback) {
        var service = this._service,
            id = this.id,
            self = this;

        function onServiceResult(code, response) {
            var err;

            response = servicesAdapter.GET(code, response);
            err = response[0];
            response = response[1];
            if (!err) {
                self.set(response);
            }
            callback(err);
        }

        if (!service) {
            console.error('Cannot fetch model: There is no service available.');

            return;
        }

        if (id === null && typeof console !== 'undefined') {
            console.error('Cannot fetch model: You havent specified an id.');

            return;
        }

        callback = callback || noop;
        service.GET(id, onServiceResult);
    },
    "save": function save(callback) {
        var service = this._service,
            self = this,
            id = this.id,
            method,
            model = this.toJSON();

        function onServiceResult(code, response) {
            var err;

            response = servicesAdapter[method](code, response);
            err = response[0];
            id = response[1];
            if (!err && id !== null) {
                self.id = id;
            }
            callback(err);
        }

        if (!service) {
            console.error('Cannot save model: There is no service available.');

            return;
        }
        callback = callback || noop;
        if (id === null) {
            method = 'POST';
            service.POST(model, onServiceResult);
        } else {
            method = 'PUT';
            service.PUT(id, model, onServiceResult);
        }
    },
    "destroy": function destroy(callback) {
        var service = this._service,
            id = this.id,
            self = this;

        function onServiceResult(code, response) {
            var err;

            err = servicesAdapter.DELETE(code, response);
            if (!err) {
                self.id = null;
            }
            callback(err);
        }

        if (!service) {
            console.error('Cannot destroy model: There is no service available.');

            return;
        }
        if (id === null && typeof console !== 'undefined') {
            console.error('Cannot destroy model: You can only destroy models that have an id.');
        }
        callback = callback || noop;
        service.DELETE(id, onServiceResult);
    },
    "_acceptCurrentState": function _acceptCurrentState() {
        var key,
            value,
            changed = this.__changed,
            attributes = this.__attributes;

        for (key in changed) { if(changed.hasOwnProperty(key)) {
            value = changed[key];
            attributes[key] = value;
            delete changed[key];
        }}
    }
};