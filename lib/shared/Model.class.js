

var nodeclass = require("nodeclass"),
    is = nodeclass.is;
var Class = nodeclass.Class;

var typeOf = require("./helpers/typeOf.js"),
    schemaHelpers = require("./schema.js");

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

module.exports = new Class({
    Extends: require('./EventEmitter.class.js'),
    "__keys": null,
    "__schema" : null,
    "__defaults": null,
    "__attributes": null,
    "__changed": null,
    "_casting": false,
    "_service": null,
    "_validators": null,
    "_id": null,
    "muted": false,
    "init": function init(id) {
        this._id = id || null;
        this.Super();
    },
    "__init": function __init() {   // used by the init function and removeAll since they act similarly
        function Attributes() {}
        function Changed() {}

        Attributes.prototype = this.__defaults;
        this.__attributes = Changed.prototype = new Attributes();
        this.__changed = new Changed();
    },
    "getId": function () {
        return this._id;
    },
    "__processResponse": function (response) {
        var err,
            id,
            model;

        err = response.error || null;
        id = response.id;
        model = response.model;
        if (!err) {
            if (id !== undefined) {
                this._id = id;
            }
            if (model) {
                this.set(model);    // this may throw an exception
            }
        }

        return err;
    },
    "_setSchema": function (schema) {

        var key,
            path,
            type;

        this.__schema = {};
        this.__keys = [];
        this.__defaults = {};

        //test
        this._validators = {};

        for (key in schema) {
            if(schema.hasOwnProperty(key)){
                path = schema[key];
                //determine supported types
                type = schemaHelpers.determineType(path);

                this.__schema[key] = {
                    type : type,
                    default : path.default,
                    validate : path.validate
                };

                this.__keys.push(key);

                if(path.default === undefined) {
                    path.default = null;
                }

                this.__defaults[key] = path.default;

                this._validators[path] = path.validate;
            }
        }
        //console.log("Schema", this.__schema, "Keys", this.__keys, "changed", this.__defaults);
        this.__init();
    },
    "set": function set(key, value) {
        var map,
            mapKey,
            self = this;

        function doSet(key, value) {
            var castingFunc,
                expectedType,
                actualType;

            if (Object.keys(self.__schema).indexOf(key) === -1) {
                throw new Error('Unknown property ' + key);
            }
            if (value === null || value === undefined) {
                value = null;
            } else {

                expectedType = self.__schema[key].type;

                if (expectedType !== undefined && expectedType !== null) {

                    actualType = typeOf(value);

                    if (actualType !== expectedType) {
                        if (self._casting) {
                            castingFunc = acceptedFunctionsLiteral.indexOf(expectedType);
                            castingFunc = acceptedFunctions[castingFunc];
                            if (castingFunc === Date) {
                                value = new Date(value);
                            } else {
                                value = castingFunc(value);
                            }
                        }
                        else {
                            throw new TypeError("Cannot set '" + key + "' to " +
                                value + ". '" + key + "' must be type of " + expectedType + ".");
                        }
                    }
                }
            }
            self.__changed[key] = value;
        }

        //setting multiple at once
        if (arguments.length === 1 && typeof key === 'object') {
            map = key;
            for (mapKey in map) {
                if(map.hasOwnProperty(mapKey)) {
                    doSet(mapKey, map[mapKey]);
                }
            }
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

        //we want to retrieve all
        if (arguments.length === 0) {
            arguments = this.__keys;
        }
        if (arguments.length === 1) {
            result = this.__changed[key];
        } else {
            result = {};
            for (i = 0, l = arguments.length; i < l; i++) {
                key = arguments[i];
                result[key] =this.__changed[key];
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

        for (key in changed) {
            if (changed.hasOwnProperty(key)) {
                delete changed[key];
            }
        }
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
        }
        else if(argsLength === 1 && typeof key === 'boolean') {
            strict = true;
            arr = this.__keys;
        }
        else {
            if (typeof arguments[argsLength - 1] === 'boolean') {
                strict = arguments[argsLength - 1];
                arr = Array.prototype.slice.call(arguments, 0, -1);
            }
            arr = arguments;
        }
        if (strict) {
            checkFunc = doStrictCheck;
        }
        else {
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
            return !changed.hasOwnProperty(key) && !attributes.hasOwnProperty(key);
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

        //each model instance has it's own schema (singleton)
        //call functions on schema for validation
        var validators = this._validators,
            type,
            i = 0,
            self = this,
            finalResult = {
                "result": false
            };

        function finish() {
            if (finalResult.client) {
                finalResult.result = finalResult.client.result === true;
            }
            if (finalResult.server) {
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
            if (typeof validators[type] === "object") {
                validators[type].validate(self._id, self.toJSON(), onValidationResult);
            } else {
                doValidation();
            }
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
            id = this._id,
            self = this;

        function onServiceResponse(code, response) {
            var err;

            //response = servicesAdapter.GET(code, response);
            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "Error while updating the model: " + err.message;
            }
            callback(err);
        }

        if (!service) {
            console.error('Cannot fetch model: There is no service available.');

            return;
        }

        if (!id) {
            console.error('Cannot fetch model: You havent specified an id.');

            return;
        }

        callback = callback || noop;
        service.GET(id, onServiceResponse);
    },
    "save": function save(callback) {

        //apply acceptCurrentState according to schema definition (server/client)

        var service = this._service,
            self = this,
            id = this._id,
            method,
            model = this.toJSON();

        function onServiceResponse(code, response) {
            var err;

            //old
            //response = servicesAdapter[method](code, response);

            //we always translate the response according to jSend

            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "Error while updating the model: " + err.message;
            }
            if (!err) {
                self.Super.emit("save");
            }
            callback(err);
        }

        if (!service) {
            console.error('Cannot save model: There is no service available.');

            return;
        }
        callback = callback || noop;
        if (id === null || typeof id === "undefined") {
            method = 'POST';
            service.POST(model, onServiceResponse);
        } else {
            method = 'PUT';
            service.PUT(id, model, onServiceResponse);
        }
    },
    "destroy": function destroy(callback) {
        var service = this._service,
            id = this._id,
            self = this;

        function finish(err) {
            if (!err) {
                self.Super.emit("destroy");
            }
            callback(err);
        }

        function onServiceResponse(code, response) {
            var err;

            //response = servicesAdapter.DELETE(code, response);
            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "Error while updating the model: " + err.message;
            }
            finish(err);
        }

        callback = callback || noop;
        if (service && id !== null) {
            service.DELETE(id, onServiceResponse);
        } else {
            finish(null);
        }
    },
    "acceptCurrentState": function _acceptCurrentState() {
        var key,
            value,
            changed = this.__changed,
            attributes = this.__attributes;

        for (key in changed) {
            if (changed.hasOwnProperty(key)) {
                value = changed[key];
                attributes[key] = value;
                delete changed[key];
            }
        }
    },
    "$find" : function $find(obj, callback) {
        //returns collections
        //always create instances and call ->fetch to populate with data
    },
    "$findById" : function $find(id, callback) {
        //this._$find({ "id" : id }, callback);
    },
    "$findOne" : function $findOne(obj, callback) {
        //returns single value
    }
});