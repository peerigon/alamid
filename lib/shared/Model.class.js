"use strict";

var nodeclass = require("nodeclass"),
    is = nodeclass.is;
var Class = nodeclass.Class;

var typeOf = require("./helpers/typeOf.js"),
    log = require("./logger.js").get("shared"),
    schemaHelpers = require("./helpers/schemaHelpers.js"),
    validate = require("./validator.js").validate,
    schemas = require("./registries/schemaRegistry.js"),
    services = require("./registries/serviceRegistry.js"),
    ModelCollection = require("./ModelCollection.class.js"),
    modelCache = require("./modelCache.js"),
    config = require("./config.js");

function noop() {}

module.exports = new Class({
    Extends: require('./EventEmitter.class.js'),
    __parentIds: {},
    __url : null,
    __keys: null,
    __schema: null,
    __sharedSchema : null,
    __defaults: null,
    __attributes: null,
    __changed: null,
    _casting: true,
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

        if(config.useCasting === undefined || config.useCasting === false) {
            this._casting = true;
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
    getUrl : function() {
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

        if(typeof response !== "object" || response === null) {
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
    __doCast : function(value, actualType, expectedType) {

        var caster = {
            String : {
                Date : function(value) {
                    var resDate = new Date(value);
                    if(resDate.toString() !== "Invalid Date") {
                        return resDate;
                    }
                    return null;
                },
                Number : function(value) {
                    var num = parseFloat(value);
                    if(Number.isNaN(num)){
                        return false;
                    }
                    return num;
                }
            },
            Number : {
                Date : function(value) {
                    //detected float!
                    if(value % 1 !== 0) {
                        return null;
                    }
                    var resDate = new Date();
                    resDate.setTime(value);
                    return resDate;
                },
                String : function(value) {
                    return String(value);
                }
            },
            Date : {
                String : function(value) {
                    return String(value);
                },
                Number : function(value) {
                    return value.getTime();
                }
            }
        };

        if(caster[actualType] !== undefined && caster[actualType][expectedType] !== undefined) {
            return caster[actualType][expectedType](value);
        }
        return null;
    },
    set: function set(key, value) {
        var map,
            mapKey,
            self = this;

        function doSet(key, value) {
            var expectedType,
                actualType;

            if(key === "id") {
                throw new Error("(alamid) Setting ids via 'set' is not allowed. Use construct!");
            }

            //we always want null instead of undefined
            if (value === null || value === undefined) {
                value = null;
            }

            if (Object.keys(self.__types).indexOf(key) === -1) {
                throw new Error('(alamid) Unknown property ' + key);
            }
            else {
                expectedType = self.__types[key];
                if (expectedType !== undefined && expectedType !== null) {
                    actualType = typeOf(value);

                    //type-checking
                    if (actualType !== expectedType) {
                        //do cast!
                        if (self._casting) {
                            value = self.__doCast(value, actualType, expectedType);
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
        //+ ID?
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
    __callService : function(serviceFunction, model, ids, data, callback) {

        var args = Array.prototype.slice.call(arguments, 0);
        //the last param is callback dude!
        callback = args[args.length-1];

        //remove the first element, because it's the function itself
        args.splice(0, 1);

        if (serviceFunction.length === args.length) {
            serviceFunction.apply(this, args);
        }
        else if(serviceFunction.length === args.length - 1) {
            //remove the final callback
            args.splice(args.length-1, 1);
            callback(serviceFunction.apply(this, args));
        }
        else {
            throw new Error("(alamid) Function '" +
                String(serviceFunction).substr(0,String(serviceFunction).indexOf(")") + 1) + "' accepts unexpected number of arguments");
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

        this.__callService(service.read, this.__ids, onServiceResponse);
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
                //instance has not been part of the registry before -> store new instance
                //cache only for newly CREATEd  / update instances should already be cached
                if(method === "create" && modelCache.get(self.__url, id) !== undefined) {
                    modelCache.add(self.Instance);
                }
                self.emit("save");
            }
            callback(err);
        }

        this.__callService(service[method], this.__ids, this.Instance, onServiceResponse);
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
        this.__callService(service.delete, this.__ids, onServiceResponse);
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
    $findById : function(ModelClass, id, callback) {
        var instance = modelCache.get(ModelClass.url, id);

        //if we don't find an instance, we add one!
        if(instance === null) {
            instance = new ModelClass(id);
            //add instance to Cache
            modelCache.add(instance);
        }

        instance.fetch(function(err) {
            if(err) {
                callback(err);
                return;
            }
            callback(null, instance);
        });
    },
    $find : function(ModelClass, obj, callback) {
        var url = ModelClass.url,
            service = services.getService(url);

        if(service === null) {
            throw new Error("(alamid) Can not call service: No service defined for '" + url + "'");
        }

        function createInstances(modelDataArray) {
            var arrayElem,
                activeModelData,
                models = [],
                modelInstance;

            for(arrayElem in modelDataArray) {
                if(modelDataArray.hasOwnProperty(arrayElem)){
                    activeModelData = modelDataArray[arrayElem];
                    if(activeModelData.id !== undefined) {

                        //check for cached instances
                        modelInstance = modelCache.get(ModelClass.url, activeModelData.id);
                        //modelInstance = null;
                        if(modelInstance === null) {
                            modelInstance = new ModelClass(activeModelData.id);
                            modelCache.add(modelInstance);
                        }

                        delete activeModelData.id;
                        modelInstance.set(activeModelData);
                        models.push(modelInstance);
                    }
                }
            }
            return models;
        }

        function onServiceResponse(response) {
            if(response.status === "success" && response.data !== undefined) {
                var modelsArray = createInstances(response.data);
                callback(null, new ModelCollection(ModelClass, modelsArray));
            }
            else {
                callback(new Error(response.message));
            }
        }

        //async
        if(service.readCollection.length === 2) {
            service.readCollection(obj, onServiceResponse);
        }
        //sync
        else if(service.readCollection.length === 1 ){
            onServiceResponse(service.readCollection(obj));
        }
        else{
            throw new Error("(alamid) Function '" +
                String(service.readCollection).substr(0,String(service.readCollection).indexOf(")") + 1) + "' accepts unexpected number of arguments");
        }
    }
});