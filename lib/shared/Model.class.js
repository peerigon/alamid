"use strict";

var value = require("value"),
    EventEmitter = require('./EventEmitter.class.js'),
    modelStatics = require("./modelStatics.js"),
    _ = require("underscore"),
    typeOf = require("./helpers/typeOf.js"),
    log = require("./logger.js").get("shared"),
    schemaHelpers = require("./helpers/schemaHelpers.js"),
    validate = require("./validator.js").validate,
    schemas = require("./registries/schemaRegistry.js"),
    services = require("./registries/serviceRegistry.js"),
    ModelCollection = require("./ModelCollection.class.js"),
    modelCache = require("./modelCache.js"),
    config = require("./config.js"),
    environment = require("./env.js"),
    RemoteService = require("../client/RemoteService.js"),
    caster = require("./caster.js");

/** @typedef {{ model: Model }} */
var ModelUpdateEvent,
    /** @typedef {{ parentIds: Object, model: Model, data : Object }} */
        ModelCreateEvent,
    /** @typedef {{ model: Model }} */
        ModelDestroyEvent;

var extend,
    slice = Array.prototype.slice;

function noop() {}

/**
 * @class Model
 * @type {Class}
 * @extends EventEmitter
 */
var Model = EventEmitter.extend("Model", {

    /**
     * @event
     * @name Model#change
     */

    /**
     * @event
     * @name Model#save
     */

    /**
     * @event
     * @name Model#create
     * @param {ModelCreateEvent} modelCreateEvent
     */

    /**
     * @event
     * @name Model#update
     * @param {ModelUpdateEvent} modelUpdateEvent
     */

    /**
     * @event
     * @name Model#destroy
     * @param {ModelDestroyEvent} modelDestroyEvent
     */

    /**
     * @event
     * @name Model#fetch
     */

    /**
     * @event
     * @name Model#dispose
     */

    /**
     * @private
     * @type {Object|Number}
     */
    __ids: null,
    /**
     * @private
     * @type {String}
     */
    __url : null,
    /**
     * @private
     * @type {Array}
     */
    __keys: null,
    /**
     * @private
     * @type {Function}
     */
    __defaults: null,
    /**
     * @private
     * @type {Function}
     */
    __attributes: null,
    /**
     * @private
     * @type {Function}
     */
    __changed: null,
    /**
     * @private
     * @type {Object}
     */
    __schema: null,
    /**
     * @private
     * @type {Object}
     */
    __sharedSchema : null,
    /**
     * @protected
     * @type {Boolean}
     */
    _casting: true,
    /**
     * @protected
     * @type {Object}
     */
    _service: null,
    /**
     * @protected
     * @type {Boolean}
     */
    muted: false,
    /**
     * Create a new Model-Instance
     * @construct
     * @param {String|Number} id
     */
    constructor: function (id) {
        var url = this.url,
            schema = schemas.getSchema(url),
            sharedSchema = schemas.getSchema(url, "shared"),
            service;

        this.__ids = {};
        this.__url = url;

        if (value(id).isSet()) {
            this.setId(id);
        }

        //load schemas
        if (schema !== null) {
            this.setSchema(schema);
        }

        if (sharedSchema !== null) {
            this.setSchema(sharedSchema, "shared");
        }

        if (config.useCasting === undefined || config.useCasting === false) {
            this._casting = true;
        }

        //load service
        service = services.getService(url);
        if (service !== null) {
            this.setService(service);
        }
    },
    __reset: function () {   // used by the init function and removeAll since they act similarly
        function Attributes() {}
        function Changed() {}

        Attributes.prototype = this.__defaults;
        this.__attributes = Changed.prototype = new Attributes();
        this.__changed = new Changed();
    },
    /**
     * get ID of active model
     * @return {String}
     */
    getId: function (modelUrl) {

        if(modelUrl === undefined) {

            //we can't use the shortcut "||" because it doesn't work with "0"
            if(this.__ids[this.__url] === undefined) {
                return null;
            }
            return this.__ids[this.__url];
        }

        if(this.__ids[modelUrl] !== undefined) {
            return this.__ids[modelUrl];
        }

        return null;
    },
    /**
     * set a single parent id
     * @param {!String} modelUrl
     * @param {!String|!Number} id
     */
    setId: function (modelUrl, id) {

        //id
        if(arguments.length === 1) {
            return this.__ids[this.__url] = modelUrl;
        }

        //ids
        return this.__ids[modelUrl] = id;
    },
    /**
     * set ids of parent models
     * @param {!Object} ids
     */
    setIds: function (ids) {

        //always keep the model id if not passed
        if(ids[this.__url] === undefined) {
            ids[this.__url] = this.__ids[this.__url];
        }
        this.__ids = ids;
    },
    /**
     * get ids of parent models
     * @return {Object}
     */
    getIds: function () {
        return this.__ids;
    },
    setUrl: function (url) {
        this.__url = url;
    },
    getUrl: function () {
        return this.__url;
    },
    /**
     * processes service-response according to jSend-spec
     * { status : "success/fail/error", data : {}, message : "error message?" }
     * @param {!Object} response
     * @return {Error} err
     * @private
     */
    __processResponse: function (response) {
        var err = null,
            model = {};

        if (typeof response !== "object" || response === null) {
            return new Error("(alamid) Invalid Response: Object expected.");
        }

        if (response.status === "error") {
            err = new Error(response.message || "An error occurred");
        }

        if (response.data !== undefined && response.status === "success") {
            model = response.data;
        }

        if (!err) {

            //set parent ids
            if (model.ids !== undefined) {
                this.setIds(model.ids);
            }
            //set id
            if (model.id !== undefined) {
                this.setId(model.id);
            }

            //set model data from data-object
            //check if not model if someone returns data : model
            if (model && !value(model).instanceOf(Model)) {
                this.set(model);    // this may throw an exception
            }
        }
        return err;
    },
    /**
     * set Schema to be used with model
     * if no schema is passed, the schema will be auto-loaded
     * @param {!Object} schema
     * @param {String} schemaType (optional) shared
     */
    setSchema: function (schema, schemaType) {

        var key,
            fieldDefinition,
            type;

        if (schemaType === "shared") {
            this.__sharedSchema = schema;
        } else {
            this.__schema = schema;
        }

        this.__keys = [];
        this.__defaults = {};
        this.__types = {};

        for (key in schema) {
            if (schema.hasOwnProperty(key)) {

                this.__keys.push(key);

                fieldDefinition = schema[key];
                //determine supported types
                type = schemaHelpers.determineType(fieldDefinition);

                if (fieldDefinition["default"] === undefined) {
                    fieldDefinition["default"] = null;
                }

                this.__types[key] = type;

                //defaults can be functions
                if (value(fieldDefinition["default"]).typeOf(Function)) {
                    this.__defaults[key] = fieldDefinition["default"]();
                } else {
                    this.__defaults[key] = fieldDefinition["default"];
                }
            }
        }
        this.__reset();
    },
    /**
     * set the service the model should use
     * @param {!Object|Function} service
     */
    setService: function (service) {
        this._service = service;
    },
    /**
     * Cast value from actualType to expectedType
     *
     * @param value
     * @param actualType
     * @param expectedType
     * @return {*}
     * @private
     */
    __doCast: function (value, actualType, expectedType) {
        return caster(value, actualType, expectedType);
    },
    /**
     * Set a single or multiple values
     *
     * use like .set("name", "octo");
     * or
     * .set({ name : "octo", age : 3 });
     *
     * NOTE: attributes "id" and "ids" will be ignored
     * use setId or setIds in order to set them
     *
     * @param {String|Object} key
     * @param {*} value
     */
    set: function (key, value) {
        var map,
            mapKey,
            self = this;

        function doSet(key, newValue) {
            var expectedType,
                actualType;

            if (key === "id" || key === "ids") {
                //ignore id & ids via set()
                //use setId and setIds
                //no error thrown anymore
                return;
            }

            //we always want null instead of undefined
            if (newValue === null || newValue === undefined) {
                newValue = null;
            }

            if (self.__types[key] === undefined) {
                throw new Error("(alamid) Unknown property '" + key + "'");
            } else {
                expectedType = self.__types[key];
                if (expectedType !== undefined && expectedType !== null) {
                    actualType = typeOf(newValue);

                    //type-checking
                    if (actualType !== expectedType) {
                        //do cast!
                        if (self._casting) {
                            newValue = self.__doCast(newValue, actualType, expectedType);
                        }
                        else {
                            throw new TypeError("Cannot set '" + key + "' to " +
                                newValue + ". '" + key + "' must be type of " + expectedType + ".");
                        }
                    }
                }
            }
            self.__changed[key] = newValue;
        }

        //setting multiple at once
        if (arguments.length === 1 && typeof key === 'object') {
            map = key;
            for (mapKey in map) {
                if (map.hasOwnProperty(mapKey)) {
                    doSet(mapKey, map[mapKey]);
                }
            }
        } else {
            doSet(key, value);
        }
        this.emit('change');
    },
    /**
     * simple emit proxy taking care of muting
     * @param {!String} event
     */
    emit : function (event) {
        if (!this.muted) {
            this._super.apply(this, arguments);
        }
    },
    /**
     * return a specific key of the model or all keys at once
     * use like
     * .get("name") to retrieve just the name.
     * or
     * .get() to retrieve all model-attributes as object
     *
     * @param {String} key
     * @return {*}
     */
    get: function (key) {
        var result,
            i, l, keysToLoad;

        //we want to retrieve all
        if (arguments.length === 0) {
            keysToLoad = this.__keys;
        } else {
            keysToLoad = arguments;
        }
        if (arguments.length === 1) {
            result = this.__changed[key];
        } else {
            result = {};
            for (i = 0, l = keysToLoad.length; i < l; i++) {
                key = keysToLoad[i];
                result[key] = this.__changed[key];
            }
        }

        return result;
    },
    /**
     * Escape a given attribute or all attributes at once
     * Function returns the given attributes
     * @param {!String} key
     * @return {*}
     */
    escape: function (key) {
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
    /**
     * Resets the attribute with the given key to the defaults
     * You can pass many keys as arguments
     *
     * .remove("name");
     * or
     * .remove("name","age");
     *
     * @param {!String} key
     */
    remove: function (key) {
        var i, l;

        for (i = 0, l = arguments.length; i < l; i++) {
            key = arguments[i];
            delete this.__changed[key];
            delete this.__attributes[key];
        }
        this.emit('change');
    },
    /**
     * Remove all attribute and reset the class to the init-state
     */
    removeAll: function () {
        this.__reset();
        this.emit('change');
    },
    /**
     * Unset the given key and revert it to the last accepted state
     * You can pass many keys at once to unset multiple keys
     * @param {!String} key
     */
    unset: function (key) {
        var i, l;

        for (i = 0, l = arguments.length; i < l; i++) {
            key = arguments[i];
            delete this.__changed[key];
        }
        this.emit('change');
    },
    /**
     * Unset all attributes at once
     * Reverts all attributes to the last accepted state
     */
    unsetAll: function () {
        var key,
            changed = this.__changed;

        for (key in changed) {
            if (changed.hasOwnProperty(key)) {
                delete changed[key];
            }
        }

        this.emit('change');
    },
    /**
     * Check if a attribute has changed
     * You can check multiple attributes by passing many keys as arguments
     *
     * @param {!String} key
     * @return {Boolean}
     */
    hasChanged: function (key) {
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
     * Check if value equals the default value
     * pass true as last argument to enable strict mode
     * strict mode checks if the value is the default value and is initial (has never been changed)
     *
     * @param {String} key
     * @param {Boolean} strict
     * @return {Boolean}
     */
    isDefault: function (key, strict) {
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
    /**
     * returns the default-values
     * @return {Object}
     */
    getDefaults: function () {
        return this.__defaults;
    },
    /**
     * Get the object-re-presentation of the model
     * Object contains id, ids and all model-attributes
     *
     * @return {*}
     */
    toObject : function () {
        var obj = this.get(),
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] === null) {
                    delete obj[key];
                }
            }
        }

        obj.id = this.getId();
        obj.ids = this.getIds();

        return obj;
    },
    /**
     * to be used by JSON.stringify
     * alias for toObject
     * Model contains id, ids and all model-attributes
     *
     * @return {*}
     */
    toJSON: function () {
        return this.toObject();
    },
    /**
     * Validate the Model on client- and serverside
     *
     * @param {!Boolean} remote Pass false if you want to disable remote-validation
     * @param {Function} callback
     */
    validate: function (remote, callback) {

        if(arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

        var schema = this.__schema,
            sharedSchema = this.__sharedSchema;

        if (schema !== null && sharedSchema !== null) {
            validate(sharedSchema, schema, this.__url, this.get(), remote, callback);
        } else{
            throw new Error("(alamid) No schema defined for model");
        }
    },
    /**
     * Call the passed service function with the given params
     * This functions takes care of sync and async service-definition
     *
     * @param {Function} serviceFunction
     * @param {String} method
     * @param {Boolean} remote
     * @param {Object} model
     * @param {Object} ids
     * @param {Object} data
     * @param {Function} callback
     * @private
     */
    __callService: function (serviceFunction, method, remote, model, ids, data, callback) {

        var args = Array.prototype.slice.call(arguments, 0);
        method = args[1];
        //the last param is callback dude!
        callback = args[args.length-1];

        //remove the first two elements, because it's the function itself and the method name
        args.splice(0, 2);

        //we don't have remote on server-services!
        if (environment.isServer()) {
            args.splice(0, 1);
        } else {
            if (remote) {
                //load remote-service-adapter for given method
                var remoteService = new RemoteService(this.__url);
                args[0] = remoteService[method].bind(remoteService);
            }
        }

        if (serviceFunction.length === args.length) {
            serviceFunction.apply(this, args);
        } else if (serviceFunction.length === args.length - 1) {
            //remove the final callback
            args.splice(args.length-1, 1);
            callback(serviceFunction.apply(this, args));
        } else {
            throw new Error("(alamid) Function '" +
                serviceFunction.toString().replace(/\s\{.*/, "") + "' accepts unexpected number of arguments");
        }
    },
    /**
     * Fetch the data for the model from the defined service (client and/or server)
     * Fetch only works for models with existing IDs
     *
     * @param {Boolean} remote  contact remoteService, defaults to true
     * @param {Function(err, result)} callback
     */
    fetch: function (remote, callback) {
        var service = this._service,
            id = this.getId(),
            ids = this.getIds(),
            self = this;

        if (arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

        function onServiceResponse(response) {
            var err;

            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "(alamid) Error while fetching the model: " + err.message;
                callback(err, response);
                return;
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
        if (id === null || id === undefined) {
            callback(new Error("(alamid) Cannot fetch model: You have to set an ID"));
            return;
        }

        this.__callService(service.read.bind(service), "read", remote, ids, onServiceResponse);
    },
    /**
     * Save or Update Model depending on an ID being set or not
     *
     * @param {Boolean} remote should a remote service be contacted (defaults to true)
     * @param {Function(err)} callback
     */
    save: function (remote, callback) {

        var service = this._service,
            id = this.getId(),
            ids = this.getIds(),
            self = this,
            method = "update";

        if (arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

        if (id === null || typeof id === "undefined") {
            method = "create";
        }

        if (!service || !service[method]) {
            callback(new Error("(alamid) Cannot save model: There is no service available for '" + method + "'"));
            return;
        }

        function onServiceResponse(response) {
            var err,
                event = {};

            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "(alamid) Error while updating the model: " + err.message;
                callback(err, response);
                return;
            }
            if (!err) {
                //instance has not been part of the registry before -> store new instance
                //cache only for newly CREATED  / update instances should already be cached
                if (method === "create" && modelCache.get(self.__url, id) === null) {
                    modelCache.add(self);
                }

                //model is always attached for create and update
                event.model = self;

                if (method === "update") {
                    event.parentIds = response.ids;
                    event.data = response.data;
                }

                self.constructor.emit(method, event);
            }

            callback(err, response);

            self.emit("save");
        }

        this.__callService(service[method].bind(service), method, remote, ids, this, onServiceResponse);
    },
    /**
     * Calls the "destroy" service, returning the status of the request (err)
     * @param {Boolean} remote
     * @param {!Function} callback
     */
    destroy: function (remote, callback) {
        var service = this._service,
            id = this.getId(),
            ids = this.getIds(),
            self = this;

        if (arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

        function onServiceResponse(response) {
            var err,
                event = {};

            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "(alamid) Error while destroying the model: " + err.message;
                callback(err, response);
                return;
            }

            if (!err) {
                event.model = self;
                self.emit("destroy", event.model);

                self.constructor.emit("destroy", event);
            }
            callback(err);
        }

        if (!service) {
            callback(new Error("(alamid) Cannot destroy model: There is no service available."));
            return;
        }
        if (value(id).isNotSet()) {
            callback(new Error("(alamid) Cannot destroy model: You have to set an ID."));
            return;
        }

        this.__callService(service.destroy.bind(service), "destroy", remote, ids, onServiceResponse);
    },
    /**
     * Accept the current state of the attributes
     * If you have accepted a state, unset will never go beyond this state
     *
     * @private
     */
    acceptCurrentState: function () {
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
    /**
     * Dispose Model
     * Removes all event listeners
     */
    dispose : function () {
        this.emit("dispose");
        this.removeAllListeners();
    }
});

extend = Model.extend;

Model.extend = function () {
    var Class = extend.apply(Model, arguments),
        url;

    _(Class).extend(EventEmitter.prototype);
    Class.find = modelStatics.find;
    Class.findById = modelStatics.findById;
    url = Class.prototype.url;
    if (url) {
        Class.prototype.url = url.toLowerCase();
    }

    return Class;
};

module.exports = Model;