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
    environment = require("./environment.js"),
    caster = require("./helpers/caster.js"),
    escaper = require("./helpers/escaper.js"),
    serviceAdapter = require("./helpers/serviceAdapter.js");

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
    _ids: null,
    /**
     * @private
     * @type {String}
     */
    _url : null,
    /**
     * @private
     * @type {Array}
     */
    _keys: null,
    /**
     * @private
     * @type {Function}
     */
    _defaults: null,

    /**
     * @private
     * @type {Object}
     */
   _types : null,
    /**
     * @private
     * @type {Function}
     */
    _attributes: null,
    /**
     * @private
     * @type {Object}
     */
    _schema: null,
    /**
     * @private
     * @type {Object}
     */
    _sharedSchema : null,
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
     * Create a new Model-Instance
     * @construct
     * @param {String|Number} id
     */
    constructor: function (id) {
        var url = this.url,
            schema = schemas.getSchema(url),
            sharedSchema = schemas.getSchema(url, "shared"),
            service;

        this._ids = {};
        this._url = url;

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
    reset: function () {   // used by the init function and removeAll since they act similarly
        function Attributes() {}

        Attributes.prototype = this._defaults;
        this._attributes = new Attributes();
    },
    /**
     * get ID of active model
     * @return {String}
     */
    getId: function (modelUrl) {

        if(modelUrl === undefined) {

            //we can't use the shortcut "||" because it doesn't work with "0"
            if(this._ids[this._url] === undefined) {
                return null;
            }
            return this._ids[this._url];
        }

        if(this._ids[modelUrl] !== undefined) {
            return this._ids[modelUrl];
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
            return this._ids[this._url] = modelUrl;
        }

        //ids
        return this._ids[modelUrl] = id;
    },
    /**
     * set ids of parent models
     * @param {!Object} ids
     */
    setIds: function (ids) {

        //always keep the model id if not passed
        if(ids[this._url] === undefined) {
            ids[this._url] = this._ids[this._url];
        }
        this._ids = ids;
    },
    /**
     * get ids of parent models
     * @return {Object}
     */
    getIds: function () {
        return this._ids;
    },
    /**
     * set the model-url
     * @param {!String} url
     */
    setUrl: function (url) {
        this._url = url;
    },
    /**
     * get the model-url
     * @return {String|_url}
     */
    getUrl: function () {
        return this._url;
    },
    /**
     * set Schema to be used with model
     * if no schema is passed, the schema will be auto-loaded
     * @param {!Object} schema
     * @param {String} schemaType (optional) shared
     */
    setSchema: function (schema, schemaType) {

        var schemaData;

        if (schemaType === "shared") {
            this._sharedSchema = schema;
        } else {
            this._schema = schema;
        }

        schemaData = schemaHelpers.processSchema(schema);

        this._keys = schemaData.keys;
        this._defaults = schemaData.defaults;
        this._types = schemaData.types;

        this.reset();
    },
    /**
     * set the service the model should use
     * @param {!Object|Function} service
     */
    setService: function (service) {
        this._service = service;
    },
    /**
     * get the service that's bound to the model
     * @return {Object|_service}
     */
    getService: function () {
        return this._service;
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

        //TODO solve with cast-module treat
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
            if (newValue === undefined) {
                newValue = null;
            }

            if (self._types[key] === undefined) {
                throw new Error("(alamid) Unknown property '" + key + "'");
            } else {
                expectedType = self._types[key];
                if (expectedType !== undefined && expectedType !== null) {
                    actualType = typeOf(newValue);

                    //type-checking
                    if (actualType !== expectedType) {
                        //do cast!
                        if (self._casting) {
                            newValue = caster(newValue, actualType, expectedType);
                        }
                        else {
                            throw new TypeError("Cannot set '" + key + "' to " +
                                newValue + ". '" + key + "' must be type of " + expectedType + ".");
                        }
                    }
                }
            }
            self._attributes[key] = newValue;
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
            keysToLoad = this._keys;
        } else {
            keysToLoad = arguments;
        }
        if (arguments.length === 1) {
            result = this._attributes[key];
        } else {
            result = {};
            for (i = 0, l = keysToLoad.length; i < l; i++) {
                key = keysToLoad[i];
                result[key] = this._attributes[key];
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

        //TODO put this flow in a separate function
        //used for get as well
        if (arguments.length === 0) {
            keysToEscape = this._keys;
        }
        else {
            keysToEscape = arguments;
        }
        if (keysToEscape.length === 1) {
            result = escaper(this._attributes[key]);
        } else {
            result = {};
            for (i = 0, l = keysToEscape.length; i < l; i++) {
                key = keysToEscape[i];
                result[key] = escaper(this._attributes[key]);
            }
        }

        return result;
    },
    /**
     * Unset the given key and revert it to the default
     * You can pass many keys at once to unset multiple keys
     * @param {!String} key
     */
    unset: function (key) {
        var i, l;

        for (i = 0, l = arguments.length; i < l; i++) {
            key = arguments[i];
            delete this._attributes[key];
        }
        this.emit('change');
    },
    /**
     * Check if value equals the default value
     * pass true as last argument to enable strict mode
     *
     * @param {String} key
     */
    isDefault: function (key) {
        var result = false,
            attributes = this._attributes,
            defaults = this._defaults,
            argsLength = arguments.length,
            arr,
            i, l;

        function doCheck() {
            return attributes[key] === defaults[key];
        }

        if (argsLength === 0) {
            arr = this._keys;
        }
        else {
            arr = arguments;
        }

        for (i = 0, l = arr.length; i < l; i++) {
            key = arr[i];
            result = doCheck();
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
        return this._defaults;
    },
    /**
     * Get the object-re-presentation of the model
     * Object contains id, ids and all model-attributes
     *
     * @return {*}
     */
    //TODO implement options for idAttribute (null = exclude ids), exclude (also for id)
    toObject : function (options) {
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

        var schema = this._schema,
            sharedSchema = this._sharedSchema;

        if (schema !== null && sharedSchema !== null) {
            validate(sharedSchema, schema, this._url, this.get(), remote, callback);
        } else{
            throw new Error("(alamid) No schema defined for model");
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

        var self = this;

        if (arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

        serviceAdapter(this, "read", remote, function onServiceResponse(err, response) {

            if (!err) {
                self.emit("fetch");
            }

            callback(err, response);
        });
    },
    /**
     * Save or Update Model depending on an ID being set or not
     *
     * @param {Boolean} remote should a remote service be contacted (defaults to true)
     * @param {Function(err)} callback
     */
    save: function (remote, callback) {

        var service = this.getService(),
            id = this.getId(),
            self = this,
            method = "update";

        if (arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

        if (id === null || typeof id === "undefined") {
            method = "create";
        }

        function onServiceResponse(err, response) {
            var event = {};

            if (!err) {
                //instance has not been part of the registry before -> store new instance
                //cache only for newly CREATED  / update instances should already be cached
                if (method === "create" && modelCache.get(self._url, id) === null) {
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

        serviceAdapter(self, method, remote, onServiceResponse);
    },
    /**
     * Calls the "destroy" service, returning the status of the request (err)
     * @param {Boolean} remote
     * @param {!Function} callback
     */
    destroy: function (remote, callback) {
        var service = this._service,
            id = this.getId(),
            self = this;

        if (arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

        function onServiceResponse(err, response) {
            var event = {};

            if (!err) {
                event.model = self;
                self.emit("destroy", event.model);
                self.constructor.emit("destroy", event);
            }

            callback(err, response);
        }

        if (value(id).isNotSet()) {
            callback(new Error("(alamid) Cannot destroy model: You have to set an ID."));
            return;
        }

        serviceAdapter(self, "destroy", remote, onServiceResponse);
    },
    /**
     * Dispose Model
     * Removes all event listeners
     */
    dispose : function () {
        this.emit("dispose");
        this.reset();
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