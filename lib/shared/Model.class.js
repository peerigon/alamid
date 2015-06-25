"use strict";

var value = require("value");
var Class = require("alamid-class");
var Signal = require("alamid-signal");
var Junction = require("alamid-junction");
var EventEmitter = Class(require("events").EventEmitter);
var Base = require("./Base.class.js");
var modelStatics = require("./modelStatics.js");
var _ = require("underscore");
var log = require("./logger.js").get("shared");
var schemaHelpers = require("./helpers/schema.js");
var validate = require("./validator.js").validate;
var services = require("./registries/serviceRegistry.js");
var ModelCollection = require("./ModelCollection.class.js");
var config = require("./config.js");
var env = require("./env.js");
var caster = require("./helpers/caster.js");
var typeOf = require("./helpers/typeOf.js");
var serviceAdapter = require("./helpers/serviceAdapter.js");
var emitErrorEvent = require("./helpers/emitErrorEvent.js");
var getResourceUrl = require("./helpers/getResourceUrl.js");

var extend;
var slice = Array.prototype.slice;

/**
 * @class Model
 * @extends Base
 * @mixins Junction
 */
var Model = Base.extend("Model", Junction, {
    /**
     * Sets alamid-signal as Signal-class that will be used by alamid-junction
     */
    Signal: Signal,
    /**
     * @private
     * @type {Object|Number}
     */
    _ids: null,
    /**
     * @private
     * @type {String}
     */
    _resourceUrl: null,
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
     * Internal flag to prevent the "change"-event from being emitted multiple times
     *
     * @private
     * @type {Boolean}
     */
    _emitChange: true,

    /**
     * Create a new Model-Instance
     *
     * @construct
     * @param {String|Number} id
     */
    constructor: function (id) {
        // Check if the model-class is initialize-able and if it has already been initialized.
        // Will only be executed once per model
        if (this.Class.initialized !== true && typeof this.Class.initialize === "function") {
            this.Class.initialize();
        }

        this._ids = {};
        this._signals = {};
        this._url = this.url;

        // Initialize attributes object
        this.reset();

        if (id) {
            if (typeof id === "object") {
                this.set(id);
            } else {
                this.setId(id);
            }
        }
    },

    /**
     * Resets all attributes to the initial state and informs all signals.
     *
     * @overrides Junction.prototype.reset
     * @returns {Model} this
     */
    reset: function () {
        var defaults = this._defaults,
            signals = this._signals,
            key;

        // We need to define this._values as well because the Junction doesn't know
        // about attributes and thus uses this._values as property store.
        this._attributes = this._values = defaults ? _(defaults).clone() : {};
        this._acceptedAttributes = defaults ? _(defaults).clone() : {};

        // Restore id attributes because ids can't be resetted
        this._attributes.ids = this.getIds();
        this._attributes.id = this.getId();

        for (key in signals) {
            if (signals.hasOwnProperty(key)) {
                signals[key](this._attributes[key]);
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
        var id;

        modelUrl = modelUrl || this._url;
        id = this._ids[modelUrl];

        if (id === undefined) {
            return null;
        }

        return id;
    },

    /**
     * set a single parent id
     *
     * @param {String=} modelUrl
     * @param {String|Number} id
     * @returns {Model} this
     */
    setId: function (modelUrl, id) {

        if (arguments.length === 1) {
            id = modelUrl;
            modelUrl = this._url;
            this._attributes.id = id;
        }

        this._ids[modelUrl] = id;
        if (this._url) {
            this._resourceUrl = getResourceUrl.graceful(this._url, this._ids);
        }

        return this;
    },

    /**
     * Set all ids related to this model.
     *
     * @param {Object} ids
     * @returns {Model} this
     */
    setIds: function (ids) {
        var key;

        for (key in ids) {
            if (ids.hasOwnProperty(key)) {
                this._ids[key] = ids[key];
            }
        }

        if (this._url) {
            this._resourceUrl = getResourceUrl.graceful(this._url, this._ids);
        }

        return this;
    },

    /**
     * Returns all ids in an object. Be sure to clone the object before changing it because this object
     * is used as internal ids-store.
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
        return this._resourceUrl || (this._resourceUrl = getResourceUrl(this._url, this._ids));
    },

    /**
     * Set Schema to be used with model. Setting a schema always resets all attributes (but no ids).
     * A local schema always overrides the shared schema.
     *
     * @param {Object} schema
     * @param {String="shared"} schemaType shared/local
     * @returns {Model} this
     */
    setSchema: function (schema, schemaType) {

        if (schemaType === "local") {
            this._localSchema = schema;
        } else {
            this._sharedSchema = schema;
        }

        // Update internal properties only if its a local schema or if there is no localSchema defined.
        if (schemaType === "local" || this.hasOwnProperty("_localSchema") === false) {
            schemaHelpers.applySchema(this, schema);

            this.reset();
        }

        return this;
    },

    /**
     * @param {String="shared"} schemaType
     * @returns {Object|null}
     */
    getSchema: function (schemaType) {
        return schemaType === "local" ? this._localSchema : this._sharedSchema;
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
     * Set a single or multiple attributes with one call. The special properties "id" and "ids"
     * are automatically applied via .setId() or setIds() respectively.
     *
     * Emits a "change"-event afterwards.
     *
     * @overrides Junction.prototype.set
     * @param {String|Object} key or an object with key/value-pairs
     * @param {*=} value
     * @returns {Model}
     */
    set: function (key, value) {

        this._emitChange = false;   // prevent signals from each emitting a change-event

        Junction.prototype.set.apply(this, arguments);

        this.emit("change");
        this._emitChange = true;

        return this;
    },

    /**
     * Update a single or multiple attributes and accept them with a single call. The special properties "id" and "ids"
     * are automatically applied via .setId() or setIds() respectively.
     *
     * When using this function, hasChanged(key) will return false afterwards. However, there's still emitted a change
     * event so event listeners are notified about the update.
     *
     * @overrides Junction.prototype.set
     * @param {String|Object} key or an object with key/value-pairs
     * @param {*=} value
     * @returns {Model}
     */
    update: function (key, value) {
        var keys = typeof key === "object"? Object.keys(key) : [key];

        this.set.apply(this, arguments);
        keys.forEach(updateAcceptedAttributes, this);

        return this;
    },
    
    /**
     * @param {String} key
     * @param {*} newValue
     * @overrides Junction.prototype.setter
     * @returns {*}
     */
    setter: function (key, newValue) {
        var expectedType,
            actualType,
            customSetters,
            i;

        if (key === "id") {
            this.setId(newValue);
            return newValue;
        } else if (key === "ids") {
            this.setIds(newValue);
            return newValue;
        }

        // Check if there is a schema
        if (!this._types) {
            return newValue;
        }

        expectedType = this._types[key];

        if (expectedType === undefined) {
            throw new Error("Cannot set attribute on model " + this._url + ": Unknown attribute key '" + key + "'.");
        }

        actualType = typeOf(newValue);

        if (actualType !== expectedType) {
            if (this._casting === false) {
                throw new TypeError("Cannot set '" + key + "' to " + newValue + ". '" + key + "' must be type of " + expectedType + ".");
            }

            newValue = caster(newValue, actualType, expectedType);
        }

        customSetters = this._setters[key];

        if (customSetters) {
            for (i = 0; i < customSetters.length; i++) {
                newValue = customSetters[i].call(this, newValue);
            }
        }

        return newValue;
    },

    /**
     * Returns a signal for the given attribute. The signal has a default attribute
     * setter applied which tries to cast the value to the schema's type. So make sure
     * to call the original signal setter if you're planing to override the setter.
     *
     * @overrides Junction.prototype.signal
     * @param {String} key
     * @returns {Function}
     */
    signal: function (key) {
        var needsToBeConfigured = Boolean(this._signals[key]) === false, // ensure that the signal is only configured once
            signal = Junction.prototype.signal.call(this, key);

        if (this._types && this._types[key] === undefined) {
            throw new Error("Cannot retrieve signal of model " + this._url + ": Unknown attribute key '" + key + "'.");
        }

        if (needsToBeConfigured) {
            signal.subscribe(onSignalChange.bind(this));
        }

        return signal;
    },

    /**
     * Unset the given key and revert it to the last accepted state.
     * You can pass many keys at once to unset multiple keys.
     * If you pass no key, all keys will be unset.
     *
     * The special properties "id" and "ids" are not unset.
     *
     * Emits a "change"-event.
     *
     * @param {String=} key
     * @returns {Model} this
     */
    unset: function (key) {
        var attributes = this._attributes,
            acceptedAttributes = this._acceptedAttributes,
            hasChanged = false,
            keys = arguments,
            value,
            signal,
            i;

        if (arguments.length === 0) {
            keys = this.getKeys();
        }

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            if (attributes.hasOwnProperty(key) === false || key === "id" || key === "ids") {
                continue;
            }
            hasChanged = true;
            value = acceptedAttributes[key];
            attributes[key] = value;
            signal = this._signals[key];
            if (signal) {
                signal(value);
            }
        }

        hasChanged && this.emit("change");

        return this;
    },

    /**
     * Remove the given attribute. If a schema is defined, the attribute
     * is not removed, but reseted to its default value.
     * You can pass many keys at once to unset multiple keys.
     * If you pass no key, all keys will be removed.
     *
     * Emits a "change"-event.
     *
     * @param {String=} key
     * @returns {Model} this
     */
    remove: function (key) {
        var attributes = this._attributes,
            acceptedAttributes = this._acceptedAttributes,
            defaults = this._defaults,
            hasChanged = false,
            keys = arguments,
            value,
            signal,
            i;

        if (arguments.length === 0) {
            keys = this.getKeys();
        }

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            if (attributes.hasOwnProperty(key) === false || key === "id" || key === "ids") {
                continue;
            }

            hasChanged = true;
            if (defaults && defaults.hasOwnProperty(key)) {
                value = defaults[key];
                attributes[key] = value;
                acceptedAttributes[key] = value;
            } else {
                delete attributes[key];
                delete acceptedAttributes[key];
            }

            signal = this._signals[key];
            if (signal) {
                signal(value);
            }
        }

        hasChanged && this.emit("change");

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
            if (key === "id" || key === "ids") {
                continue;
            }
            if (attributes.hasOwnProperty(key)) {
                value = this._attributes[key];
                lastState[key] = value;
            }
        }

        return this;
    },
    
    /**
     * Check if value equals the default value.
     *
     * The special properties "id" and "ids" are not taken into account.
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
            if (key === "id" || key === "ids") {
                continue;
            }
            if (this._attributes[key] !== defaults[key]) {
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
     * Returns all the fields that have changed since the last "accept" call.
     *
     * The special properties "id" and "ids" are not taken into account.
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
            if (key === "id" || key === "ids") {
                continue;
            }
            if (attributes.hasOwnProperty(key)) {
                value = this._attributes[key];
                if (value !== lastState[key]) {
                    result[key] = value;
                }
            }
        }

        return result;
    },
    
    /**
     * Check if an attribute or multiple attributes have changed since last "accept".
     *
     * The special properties "id" and "ids" are not taken into account.
     * 
     * @param {String=} key
     * @returns {Boolean}
     */
    hasChanged: function (key) {
        var acceptedAttributes = this._acceptedAttributes,
            keys,
            i;

        keys = arguments.length === 0? this._keys : arguments;

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            if (key === "id" || key === "ids") {
                continue;
            }
            if (this._attributes[key] !== acceptedAttributes[key]) {
                return true;
            }
        }

        return false;
    },
    
    /**
     * Returns an object-representation of the model. The returned object contains id, ids
     * and all model-attributes.
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
        exclude = options.exclude;
        changedOnly = options.changedOnly || false;
        idAttribute = options.idAttribute || "id";

        schema = options.schemaType ?
            (options.schemaType === "local" ? this._localSchema: this._sharedSchema):
            false;

        obj = changedOnly ? this.getChanged(): this.get();

        // delete the default id-attribute just in case another attribute is wanted
        delete obj.id;
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
                if (exclude && _(exclude).contains(key)) {
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

        if(!localSchema) {
            localSchema = sharedSchema;
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
                resourceUrl;

            if (err) {
                emitErrorEvent(Class, new ErrorEvent(Class, self, response));
            } else {
                if (cache) {
                    resourceUrl = self.getResourceUrl();
                    if (!cache.get(resourceUrl)) {
                        cache.set(resourceUrl, self);
                    }
                }
                self.accept();
            }

            self.emit("fetch", new FetchEvent(self, self));
            Class.emit("fetch", new FetchEvent(Class, self));

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

        this._super();

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

/**
 * @this Model
 */
function onSignalChange() { /* jshint validthis: true */
    if (this._emitChange) {
        this.emit("change");
    }
}

/**
 * @this Model
 */
function updateAcceptedAttributes(key) { /* jshint validthis: true */
    this._acceptedAttributes[key] = this._attributes[key];
}

extend = Model.extend;
Model.extend = function () {
    var Class = extend.apply(Model, arguments),
        url;

    EventEmitter.mixin(Class);
    Class.initialized = false;
    Class.initialize = modelStatics.initialize;
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
 * @class FetchEvent
 */
function FetchEvent(target, model) {
    this.target = target;
    this.model = model;
}
FetchEvent.prototype.name = "FetchEvent";
FetchEvent.prototype.target = null;
FetchEvent.prototype.model = null;

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