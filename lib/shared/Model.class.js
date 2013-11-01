"use strict";

var value = require("value"),
    Class = require("alamid-class"),
    Junction = require("alamid-junction"),
    EventEmitter = Class(require("events").EventEmitter),
    modelStatics = require("./modelStatics.js"),
    _ = require("underscore"),
    typeOf = require("./helpers/typeOf.js"),
    log = require("./logger.js").get("shared"),
    schemaHelpers = require("./helpers/schema.js"),
    validate = require("./validator.js").validate,
    schemas = require("./registries/schemaRegistry.js"),
    services = require("./registries/serviceRegistry.js"),
    ModelCollection = require("./ModelCollection.class.js"),
    config = require("./config.js"),
    env = require("./env.js"),
    caster = require("./helpers/caster.js"),
    serviceAdapter = require("./helpers/serviceAdapter.js"),
    emitErrorEvent = require("./helpers/emitErrorEvent.js");

var extend,
    slice = Array.prototype.slice;

/**
 * @class Model
 * @extends EventEmitter
 * @mixins Junction
 */
var Model = EventEmitter.extend("Model", Junction, {

    /**
     * @private
     * @type {Object|Number}
     */
    _ids: null,
    /**
     * @private
     * @type {String}
     */
    _url: null,
    /**
     * @private
     * @type {Array}
     */
    _keys: null,
    /**
     * @private
     * @type {Object}
     */
    _types: null,
    /**
     * @private
     * @type {Object}
     */
    _defaults: null,
    /**
     * @private
     * @type {Object}
     */
    _attributes: null,
    /**
     * @private
     * @type {Object}
     */
    _acceptedAttributes: null,
    /**
     * @private
     * @type {Object}
     */
    _signals: null,
    /**
     * @private
     * @type {Object}
     */
    _setters: null,
    /**
     * @private
     * type: {Object}
     */
    _localSchema: null,
    /**
     * @private
     * @type {Object}
     */
    _sharedSchema: null,
    /**
     * @private
     * @type {Boolean}
     */
    _casting: true,
    /**
     * @private
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
            localSchema = schemas.getSchema(url),
            sharedSchema = schemas.getSchema(url, "shared"),
            service;

        this._ids = {};
        this._signals = {};
        this._url = url;

        if (value(id).isSet()) {
            this.setId(id);
        }

        if (localSchema) {
            this.setSchema(localSchema, "local");
            // Set the sharedSchema as well, but don't update _keys, _defaults, etc.
            this._sharedSchema = sharedSchema || null;
        } else if (sharedSchema) {
            this.setSchema(sharedSchema);
        } else {
            this.reset();
        }

        if (config.use !== undefined && (config.use.casting === undefined || config.use.casting === false)) {
            this._casting = true;
        }

        //load service
        service = services.getService(url);
        if (service !== null) {
            this.setService(service);
        }
    },

    /**
     * Resets the model to the initial state and informs all signals.
     *
     * @overrides Junction.prototype.reset
     * @returns {Model} this
     */
    reset: function () {
        var signals = this._signals,
            key;

        this._acceptedAttributes = this._defaults ? Object.create(this._defaults): {};
        this._attributes = this._values = Object.create(this._acceptedAttributes); // Also set this._values for the Junction
        for (key in signals) {
            if (signals.hasOwnProperty(key)) {
                signals[key](this._attributes[key]); // we can't just pass undefined because maybe there are defaults
            }
        }

        return this;
    },

    /**
     * Get the id of the current or one of the parent models.
     *
     * @param {String=} modelUrl
     * @returns {String|Number}
     */
    getId: function (modelUrl) {

        if (modelUrl === undefined) {

            //we can't use the shortcut "||" because it doesn't work with "0"
            if (this._ids[this._url] === undefined) {
                return null;
            }
            return this._ids[this._url];
        }

        if (this._ids[modelUrl] !== undefined) {
            return this._ids[modelUrl];
        }

        return null;
    },

    /**
     * set a single parent id
     *
     * @param {String=} modelUrl
     * @param {String|Number} id
     * @returns {Model} this
     */
    setId: function (modelUrl, id) {

        //id
        if (arguments.length === 1) {
            this._ids[this._url] = modelUrl;
            return this;
        }

        //ids
        this._ids[modelUrl] = id;
        return this;
    },

    /**
     * Set all ids related to this model.
     *
     * @param {Object} ids
     * @returns {Model} this
     */
    setIds: function (ids) {

        //always keep the model id if not passed
        if (ids[this._url] === undefined) {
            ids[this._url] = this._ids[this._url];
        }
        this._ids = _(ids).clone();

        return this;
    },

    /**
     * Get all ids (including parent models)
     *
     * @return {Object}
     */
    getIds: function () {
        return this._ids;
    },

    /**
     * @param {String} url
     */
    setUrl: function (url) {
        this._url = url;
    },

    /**
     * @returns {String}
     */
    getUrl: function () {
        return this._url;
    },

    /**
     * Returns the resource's url generated from the url and ids, e.g. "/post/23/comment/35"
     * @returns {String}
     */
    getResourceUrl: function () {
        return this.Class.getResourceUrl(this._ids);
    },

    /**
     * Set Schema to be used with model. Setting a schema always resets all attributes (but no ids).
     * If no schema is passed, the schema will be auto-loaded.
     * A local schema always overrides the shared schema.
     *
     * @param {Object} schema
     * @param {String="shared"} schemaType shared/local
     * @returns {Model} this
     */
    setSchema: function (schema, schemaType) {

        var schemaData;

        if (schemaType === "local") {
            this._localSchema = schema;
        } else {
            this._sharedSchema = schema;
        }

        // Update internal properties only if its a local schema or there is no localSchema defined.
        if (schemaType === "local" || !this._localSchema) {
            schemaData = schemaHelpers.processSchema(schema);

            this._keys = schemaData.keys;
            this._defaults = schemaData.defaults;
            this._types = schemaData.types;
            this._setters = schemaData.setters;

            this.reset();
        }

        return this;
    },

    /**
     * @param {String="shared"} schemaType
     * @returns {Object|null}
     */
    getSchema: function (schemaType) {
        if (schemaType === "local") {
            return this._localSchema;
        } else {
            return this._sharedSchema;
        }
    },

    /**
     * @param {Object|Function} service
     * @returns {Model} this
     */
    setService: function (service) {
        this._service = service;

        return this;
    },

    /**
     * @returns {Object|Function}
     */
    getService: function () {
        return this._service;
    },

    /**
     * Set a single or multiple attributes with one call.
     * Emits a "change"-event afterwards.
     *
     * @overrides Junction.prototype.set
     * @param {String|Object} key or an object with key/value-pairs
     * @param {*=} value
     * @returns {Model}
     */
    set: function (key, value) {
        Junction.prototype.set.apply(this, arguments);
        this.emit("change");
        return this;
    },
    
    /**
     * @param {String} key
     * @param {*} newValue
     * @overrides Junction.prototype.setter
     * @private
     */
    setter: function (key, newValue) {
        var expectedType,
            actualType,
            setters,
            i;
    
        if (key === "id" || key === "ids") {
            //ignore id & ids via set()
            //use setId and setIds
            return;
        }
    
        //check if there is a schema
        if (this._types) {
    
            if (this._types[key] === undefined) {
                throw new Error("(alamid) Unknown property '" + key + "'");
            }
    
            expectedType = this._types[key];
            if (value(expectedType).isSet()) {
                actualType = typeOf(newValue);
    
                //type-checking
                if (actualType !== expectedType) {
                    if (this._casting === false) {
                        throw new TypeError("Cannot set '" + key + "' to " + newValue + ". '" + key + "' must be type of " + expectedType + ".");
                    }
    
                    newValue = caster(newValue, actualType, expectedType);
                }
            }
        }
    
        if (this._setters && this._setters.hasOwnProperty(key)) {
            setters = this._setters[key];
    
            for (i = 0; i < setters.length; i++) {
                newValue = setters[i].call(newValue, newValue);
            }
        }
    
        Junction.prototype.setter.call(this, key, newValue);
    },

    /**
     * Retrieve one or all attributes.
     *
     * @overrides Junction.prototype.get
     * @param {String=} key
     * @returns {*}
     */
    get: function (key) {
        var keys,
            value,
            i,
            result;

        if (arguments.length === 0) {
            result = {};
            keys = this._keys || Object.keys(this._attributes);
            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                value = this.getter(key);
                if (value !== undefined) {
                    result[key] = value;
                }
            }
            return result;
        }

        return this.getter(key);
    },

    /**
     * Unset the given key and revert it to the last accepted state.
     * You can pass many keys at once to unset multiple keys.
     * If you pass no key, all keys will be unset.
     * Emits a "change"-event.
     *
     * @param {String=} key
     * @returns {Model} this
     */
    unset: function (key) {
        var attributes = this._attributes,
            keys = arguments,
            signal,
            i;

        if (arguments.length === 0) {
            keys = Object.keys(attributes);
        }

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            delete attributes[key];
            signal = this._signals[key];
            if (signal) {
                signal(attributes[key]);
            }
        }

        this.emit("change");

        return this;
    },

    /**
     * Remove the given attribute. If a schema is defined, the attribute's
     * default value will be applied.
     * You can pass many keys at once to unset multiple keys.
     * If you pass no key, all keys will be removed.
     * Emits a "change"-event.
     *
     * @param {String=} key
     * @returns {Model} this
     */
    remove: function (key) {
        var attributes = this._attributes,
            acceptedAttributes = this._acceptedAttributes,
            signal,
            keys = arguments,
            i;

        if (arguments.length === 0) {
            keys = Object.keys(attributes);
        }

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            delete attributes[key];
            delete acceptedAttributes[key];
            signal = this._signals[key];
            if (signal) {
                signal(attributes[key]);
            }
        }

        this.emit("change");

        return this;
    },

    /**
     * Accept the current state of the model.
     * The accepted state is used to determine changed attributes.
     * This function gets called automatically on successful fetch/save/destroy
     *
     * @return {Model} this
     */
    accept: function () {
        var key,
            value,
            attributes = this._attributes,
            lastState = this._acceptedAttributes;

        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                value = this.getter(key);
                lastState[key] = value;
                delete attributes[key];
            }
        }

        return this;
    },
    
    /**
     * Check if value equals the default value.
     *
     * @param {String=} key
     * @returns {Boolean}
     */
    isDefault: function (key) {
        var result = true,
            defaults = this._defaults,
            keys,
            i;

        keys = arguments.length === 0? this._keys : arguments;

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            if (this.getter(key) !== defaults[key]) {
                result = false;
                break;
            }
        }

        return result;
    },
    
    /**
     * Returns all attribute names as an array.
     * Please note: Don't modify this array.
     * 
     * @returns {Array}
     */
    getKeys: function () {
        return this._keys || Object.keys(this._attributes);
    },
    
    /**
     * Returns all default values as object.
     * Please note: Don't modify this object.
     * 
     * @returns {Object}
     */
    getDefaults: function () {
        return this._defaults;
    },
    
    /**
     * Returns all the fields that have changed since the last "accept" call
     * 
     * @returns {Object}
     */
    getChanged: function () {
        var result = {},
            attributes = this._attributes,
            lastState = this._acceptedAttributes,
            value,
            key;

        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                value = this.getter(key);
                if (value !== lastState[key]) {
                    result[key] = value;
                }
            }
        }

        return result;
    },
    
    /**
     * Check if an attribute or multiple attributes have changed since last "accept"
     * 
     * @param {String=} key
     * @returns {Boolean}
     */
    hasChanged: function (key) {
        var result = false,
            acceptedAttributes = this._acceptedAttributes,
            keys,
            i;

        keys = arguments.length === 0? this._keys : arguments;

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            if (this.getter(key) !== acceptedAttributes[key]) {
                result = true;
                break;
            }
        }

        return result;
    },
    
    /**
     * Get the object-representation of the model.
     * The object contains id, ids and all model-attributes.
     * 
     * Options example:
     * {
     *      exclude: ["secretField"],
     *      idAttribute: "_id",
     *      changedOnly: true
     * }
     *
     * @param {Object=} options
     * @returns {Object}
     */
    toObject: function (options) {
        var obj,
            changedOnly,
            key,
            idAttribute,
            schema,
            exclude;

        options = options || {};
        exclude = options.exclude || [];
        changedOnly = options.changedOnly || false;
        idAttribute = options.idAttribute || "id";

        schema = options.schemaType ?
            (options.schemaType === "local" ? this._localSchema: this._sharedSchema):
            false;

        obj = changedOnly ? this.getChanged(): this.get();

        obj[idAttribute] = this.getId();
        obj.ids = this.getIds();

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {

                //hide undefined fields, but never hide id
                if (obj[key] === undefined && key !== idAttribute) {
                    delete obj[key];
                }

                if (schema && !schema[key]) {
                    delete obj[key];
                }

                //remove excluded fields
                if (_(exclude).contains(key)) {
                    delete obj[key];
                }
            }
        }

        return obj;
    },
    
    /**
     * To be used by JSON.stringify
     * Alias for .toObject() without options
     * The object contains id, ids and all model-attributes
     *
     * @returns {Object}
     */
    toJSON: function () {
        return this.toObject();
    },
    
    /**
     * Validate the Model on client- and server-side
     *
     * @param {Boolean=true} remote Pass false if you want to disable remote-validation
     * @param {Function=noop} callback
     */
    validate: function (remote, callback) {
        var localSchema = this._localSchema,
            sharedSchema = this._sharedSchema;

        if (arguments.length === 1) {
            callback = arguments[0];
            remote = true;
        }

        callback = callback || noop;

        if (localSchema !== null && sharedSchema !== null) {
            validate(sharedSchema, localSchema, this._url, this.toObject(), remote, callback);
        } else {
            throw new Error("(alamid) No schema defined for model '" + this._url + "'");
        }
    },
    
    /**
     * Fetch the data for the model from the defined service (client and/or server)
     * Fetch only works for models with existing IDs
     *
     * @param {Boolean=true} remote  contact remoteService, defaults to true
     * @param {Function=noop} callback
     */
    fetch: function (remote, callback) {

        var self = this,
            id = this.getId();

        if (typeof remote === "function") {
            callback = arguments[0];
        }
        callback = typeof callback === "function"? callback: noop;
        remote = typeof remote === "boolean"? remote: true;

        if (value(id).isNotSet()) {
            callback(new Error("(alamid) Cannot fetch model: You have to set an ID."));
            return;
        }

        serviceAdapter(this, "read", remote, function onServiceResponse(err, response) {
            var Class = self.Class,
                cache = Class.cache,
                resourceUrl = self.getResourceUrl();

            if (cache && !cache.get(resourceUrl)) {
                cache.set(resourceUrl, self);
            }

            if (err) {
                emitErrorEvent(Class, new ErrorEvent(Class, self, response));
            } else {
                self.accept();
            }

            callback(err, response);
        });
    },
    
    /**
     * Save or Update Model depending on an ID being set or not
     *
     * @param {Boolean=true} remote should a remote service be contacted (defaults to true)
     * @param {Function=noop} callback
     */
    save: function (remote, callback) {

        var id = this.getId(),
            self = this,
            method = "update";

        if (typeof remote === "function") {
            callback = arguments[0];
        }
        callback = typeof callback === "function"? callback: noop;
        remote = typeof remote === "boolean"? remote: true;

        if (id === null || typeof id === "undefined") {
            method = "create";
        }

        serviceAdapter(self, method, remote, function onServiceResponse(err, response) {
            var Class = self.Class,
                cache = Class.cache;

            if (err) {
                emitErrorEvent(Class, new ErrorEvent(Class, self, response));
            } else {
                self.accept();
                self.emit("save", new SaveEvent(self));

                if (method === "create") {
                    if (cache) {
                        cache.set(self.getResourceUrl(), self);
                    }
                    Class.emit("create", new CreateEvent(Class, self));
                } else {
                    Class.emit("update", new UpdateEvent(Class, self));
                }
            }

            callback(err, response);
        });
    },
    
    /**
     * Calls the "destroy" service, returning the status of the request (err)
     * @param {Boolean=true} remote
     * @param {Function=noop} callback
     */
    destroy: function (remote, callback) {
        var id = this.getId(),
            self = this;

        if (typeof remote === "function") {
            callback = arguments[0];
        }
        callback = typeof callback === "function"? callback: noop;
        remote = typeof remote === "boolean"? remote: true;

        if (value(id).isNotSet()) {
            callback(new Error("(alamid) Cannot destroy model: You have to set an ID."));
            return;
        }

        serviceAdapter(self, "destroy", remote, function onServiceResponse(err, response) {
            var Class = self.Class,
                cache = Class.cache;

            if (err) {
                emitErrorEvent(Class, new ErrorEvent(Class, self, response));
            } else {
                self.accept();

                if (cache) {
                    cache.remove(self.getResourceUrl());
                }

                self.emit("destroy", new DestroyEvent(self, self));
                Class.emit("destroy", new DestroyEvent(Class, self));
            }

            callback(err, response);
        });
    },
    
    /**
     * Removes all event listeners and clears all references from this instance. Call this function
     * if you don't need the instance anymore.
     */
    dispose: function () {
        Junction.prototype.dispose.call(this);
        this.emit("dispose", new DisposeEvent(this));
        this.removeAllListeners();

        // clearing references
        this._ids = null;
        this._keys = null;
        this._types = null;
        this._defaults = null;
        this._attributes = null;
        this._acceptedAttributes = null;
        this._setters = null;
        this._localSchema = null;
        this._sharedSchema = null;
        this._service = null;
    }
});

extend = Model.extend;
Model.extend = function () {
    var Class = extend.apply(Model, arguments),
        url;

    EventEmitter.mixin(Class);
    Class.find = modelStatics.find;
    Class.findById = modelStatics.findById;
    Class.getResourceUrl = modelStatics.getResourceUrl;
    url = Class.prototype.url;
    if (url) {
        Class.prototype.url = url.toLowerCase();
    }

    return Class;
};

// Make the model class itself as EventEmitter
// TODO: Reevaluate with real-time handling @see https://github.com/peerigon/alamid/issues/129
EventEmitter.mixin(Model);

function noop() {}

/**
 * @class SaveEvent
 */
function SaveEvent(target) {
    this.target = target;
}
SaveEvent.prototype.name = "SaveEvent";
SaveEvent.prototype.target = null;

/**
 * @class CreateEvent
 */
function CreateEvent(target, model) {
    this.target = target;
    this.model = model;
}
CreateEvent.prototype.name = "CreateEvent";
CreateEvent.prototype.target = null;
CreateEvent.prototype.model = null;

/**
 * @class UpdateEvent
 */
function UpdateEvent(target, model) {
    this.target = target;
    this.model = model;
}
UpdateEvent.prototype.name = "UpdateEvent";
UpdateEvent.prototype.target = null;
UpdateEvent.prototype.model = null;

/**
 * @class DestroyEvent
 */
function DestroyEvent(target, model) {
    this.target = target;
    this.model = model;
}
DestroyEvent.prototype.name = "DestroyEvent";
DestroyEvent.prototype.target = null;
DestroyEvent.prototype.model = null;

/**
 * @class ErrorEvent
 */
function ErrorEvent(target, model, response) {
    this.target = target;
    this.model = model;
    this.response = response;
}
ErrorEvent.prototype.name = "ErrorEvent";
ErrorEvent.prototype.target = null;
ErrorEvent.prototype.model = null;
ErrorEvent.prototype.response = null;

/**
 * @class DisposeEvent
 */
function DisposeEvent(target) {
    this.target = target;
}
DisposeEvent.prototype.name = "DisposeEvent";
DisposeEvent.prototype.target = null;

module.exports = Model;