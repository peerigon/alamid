"use strict";

var nodeclass = require("nodeclass"),
    is = nodeclass.is;
var Class = nodeclass.Class;

var typeOf = require("./helpers/typeOf.js"),
    log = require("./logger.js").get("shared"),
    schemaHelpers = require("./schema.js"),
    validate = require("./validator.js").validate,
    schemas = require("./registries/schemaRegistry.js"),
    services = require("./registries/serviceRegistry.js");

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
    __parentIds: null,
    __url : null,
    __keys: null,
    __schema: null,
    __sharedSchema : null,
    __defaults: null,
    __attributes: null,
    __changed: null,
    _casting: false,
    _service: null,
    _id: null,
    muted: false,
    /**
     * Create a new Model-Instance
     * @construct
     * @param id
     */
    init: function init(id) {

        this._id = id || null;
        this.__url = this.Instance.constructor.url || null;

        var url = this.__url,
            schema = schemas.getSchema(url),
            sharedSchema = schemas.getSchema(url, "shared"),
            service;

        //load schemas
        if(schema !== null) {
            this.setSchema(schema);
        }

        if(sharedSchema !== null) {
            this.setSchema(sharedSchema, "shared");
        }

        //load service
        service = services.getService(url);
        if(service !== null) {
            this.setService(service);
        }
    },
    __reset: function() {   // used by the init function and removeAll since they act similarly
        function Attributes() {}
        function Changed() {}

        Attributes.prototype = this.__defaults;
        this.__attributes = Changed.prototype = new Attributes();
        this.__changed = new Changed();
    },
    /**
     * get ID
     * @return {*}
     */
    getId: function () {
        return this._id;
    },
    /**
     * set ids of parent models
     * @param {Object} parentIds
     */
    setParentIds : function(parentIds) {
        this.__parentIds = parentIds;
    },
    setParentId : function(parentName, parentId) {
        this.__parentIds[parentName] = parentId;
    },
    /**
     * get ids of parent models
     * @return {Object}
     */
    getParentIds : function() {
        return this.__parentIds;
    },
    getParentId : function(parentName) {
        return this.__parentIds[parentName];
    },
    setUrl : function(url) {
        this.__url = url;
    },
    getUrl : function(url) {
        return this.__url;
    },
    /**
     * processes service-response according to jSend-spec
     * { status : "success/fail/error", data : {}, message : "error message?" }
     * @param response
     * @return {Object} err
     * @private
     */
    __processResponse: function (response) {
        var err = null,
            id,
            model;

        if(typeof response !== "object") {
            return new Error("(alamid) Invalid Response: Object expected.");
        }

        if(response.status === "error") {
            err = new Error(response.message || "An error occurred");
        }

        if(response.data !== undefined) {
            model = response.data;
            id = model.id;
        }

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
    /**
     * set Schema to be used with model
     * if no schema is passed, the schema will be auto-loaded
     * @param {!Object} schema
     * @param {String} schemaType (optinal) shared
     */
    setSchema: function (schema, schemaType) {

        var key,
            fieldDefinition,
            type;

        if(schemaType === "shared") {
            this.__sharedSchema = schema;
        }
        else {
            this.__schema = schema;
        }

        this.__keys = [];
        this.__defaults = {};
        this.__types = {};

        for (key in schema) {
            if(schema.hasOwnProperty(key)){

                this.__keys.push(key);

                fieldDefinition = schema[key];
                //determine supported types
                type = schemaHelpers.determineType(fieldDefinition);

                if(fieldDefinition.default === undefined) {
                    fieldDefinition.default = null;
                }
                this.__types[key] = type;
                this.__defaults[key] = fieldDefinition.default;
            }
        }
        this.__reset();
    },
    setService : function(service) {
        this._service = service;
    },
    set: function set(key, value) {
        var map,
            mapKey,
            self = this;

        function doSet(key, value) {
            var castingFunc,
                expectedType,
                actualType;

            if (Object.keys(self.__types).indexOf(key) === -1) {
                throw new Error('(alamid) Unknown property ' + key);
            }
            if (value === null || value === undefined) {
                value = null;
            }
            else {
                expectedType = self.__types[key];
                if (expectedType !== undefined && expectedType !== null) {
                    actualType = typeOf(value);

                    //type-checking
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
        this.emit('change');
    },
    emit : function(event) {
        if (!this.muted) {
            this.Super.emit(event);
        }
    },
    get: function get(key) {
        var result,
            i, l, keysToLoad;

        //we want to retrieve all
        if (arguments.length === 0) {
            keysToLoad = this.__keys;
        }
        else {
            keysToLoad = arguments;
        }
        if (arguments.length === 1) {
            result = this.__changed[key];
        }
        else {
            result = {};
            for (i = 0, l = keysToLoad.length; i < l; i++) {
                key = keysToLoad[i];
                result[key] =this.__changed[key];
            }
        }

        return result;
    },
    escape: function escape(key) {
        var result,
            i, l,
            keysToEscape;

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
            keysToEscape = this.__keys;
        }
        else {
            keysToEscape = arguments;
        }
        if (keysToEscape.length === 1) {
            result = doEscape(this.__changed[key]);
        } else {
            result = {};
            for (i = 0, l = keysToEscape.length; i < l; i++) {
                key = keysToEscape[i];
                result[key] = doEscape(this.__changed[key]);
            }
        }

        return result;
    },
    remove: function remove(key) {
        var i, l;

        for (i = 0, l = arguments.length; i < l; i++) {
            key = arguments[i];
            delete this.__changed[key];
            delete this.__attributes[key];
        }
        this.emit('change');
    },
    removeAll: function removeAll() {
        this.__reset();
        this.emit('change');
    },
    unset: function unset(key) {
        var i, l;

        for (i = 0, l = arguments.length; i < l; i++) {
            key = arguments[i];
            delete this.__changed[key];
        }
        this.emit('change');
    },
    unsetAll: function unsetAll() {
        var key,
            changed = this.__changed;

        for (key in changed) {
            if (changed.hasOwnProperty(key)) {
                delete changed[key];
            }
        }
        this.emit('change');

    },
    hasChanged: function hasChanged(key) {
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
            arr = arguments;
            if (typeof arguments[argsLength - 1] === 'boolean') {
                strict = arguments[argsLength - 1];
                arr = Array.prototype.slice.call(arguments, 0, -1);
            }
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
    /**
     * check if value equals the default value
     * pass true as last argument to enable strict mode
     * strict mode checks if the value is the default value and is initial (has never been changed)
     * @param key
     * @return {Boolean}
     */
    isDefault: function isDefault(key) {
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
        }
        else if(argsLength === 1 && typeof key === 'boolean') {
            strict = true;
            arr = this.__keys;
        }
        else {
            arr = arguments;
            if (typeof arguments[argsLength - 1] === 'boolean') {
                strict = arguments[argsLength - 1];
                arr = Array.prototype.slice.call(arguments, 0, -1);
            }
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
    getDefaults: function () {
        return this.__defaults;
    },
    toObject : function() {
        return this.get();
    },
    toJSON: function () {
        return JSON.stringify(this.get());
    },
    validate: function (callback) {
        var fullValidation = true;

        if(arguments.length === 2) {
            fullValidation = callback;
            callback = arguments[1];
        }

        var schema = this.__schema,
            sharedSchema = this.__sharedSchema;

        if(schema !== null && sharedSchema !== null) {
            validate(sharedSchema, schema, this.url, this.get(), fullValidation, callback);
        }
        else{
            throw new Error("(alamid) No schema defined for model");
        }
    },
    fetch: function fetch(callback) {
        var service = this._service,
            id = this._id,
            self = this;

        callback = callback || noop;

        function onServiceResponse(response) {
            var err;
            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "(alamid) Error while fetching the model: " + err.message;
            }
            if (!err) {
                self.emit("fetch");
            }
            callback(err);
        }

        if (!service) {
            callback(new Error("(alamid) Cannot fetch model: There is no service available."));
            return;
        }
        if (!id) {
            callback(new Error("(alamid) Cannot fetch model: You have to set an ID"));
            return;
        }
        service.read(this.Instance, onServiceResponse);
    },
    save: function save(callback) {

        var service = this._service,
            id = this._id,
            self = this,
            method = "update";

        callback = callback || noop;

        if (id === null || typeof id === "undefined") {
            method = "create";
        }

        if (!service || !service[method]) {
            callback(new Error("(alamid) Cannot save model: There is no service available for '" + method + "'"));
            return;
        }

        function onServiceResponse(response) {
            var err;
            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "(alamid) Error while updating the model: " + err.message;
            }
            if (!err) {
                self.emit("save");
            }
            callback(err);
        }

        service[method](this.Instance, onServiceResponse);
    },
    destroy: function (callback) {
        var service = this._service,
            id = this._id,
            self = this;

        callback = callback || noop;

        function onServiceResponse(response) {
            var err;
            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "(alamid) Error while deleting the model: " + err.message;
            }
            if (!err) {
                self.emit("delete");
            }
            callback(err);
        }

        if (!service) {
            callback(new Error("(alamid) Cannot delete model: There is no service available."));
            return;
        }
        if (!id) {
            callback(new Error("(alamid) Cannot delete model: You have to set an ID"));
            return;
        }

        service.delete(this.Instance, onServiceResponse);
    },
    acceptCurrentState: function _acceptCurrentState() {
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
    $find : function(ModelClass, obj, callback) {
        //todo we want a full url here with ids..
        //does not work in static context
        var url = ModelClass.url,
            service = services.getService(url);

        if(service === null) {
            throw new Error("(alamid) Can not call service: No service defined for '" + url + "'");
        }
        service.readCollection(obj, function(response) {
            //TODO instantiate model-collection here
            callback(response);
        });
    }
});



