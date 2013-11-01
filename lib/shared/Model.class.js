"use strict";

var value = require("value"),
    Class = require("alamid-class"),
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
    escaper = require("./helpers/escaper.js"),
    serviceAdapter = require("./helpers/serviceAdapter.js"),
    Event = require("./Event.class.js"),
    emitErrorEvent = require("./helpers/emitErrorEvent.js");

var extend,
    slice = Array.prototype.slice;

/**
 * @class Model
 * @extends EventEmtter
 */
var Model = EventEmitter.extend("Model", {

    /**
     * Indicates if this instance has been disposed.
     * @type {Boolean}
     * @readonly
     */
    isDisposed: false,
    /**
     * @private
     * @type {Object|Number}
     */
    _ids : null,
    /**
     * @private
     * @type {String}
     */
    _url : null,
    /**
     * @private
     * @type {Array}
     */
    _keys : null,
    /**
     * @private
     * @type {Object}
     */
    _types : null,
    /**
     * @private
     * @type {Object}
     */
    _defaults : null,
    /**
     * @private
     * @type {Object}
     */
    _attributes : null,
    /**
     * @private
     * @type {Object}
     */
    _acceptedAttributes : null,
    /**
     * @private
     * @type {Object}
     */
    _setters : null,
    /**
     * @private
     * type: {Object}
     */
    _localSchema : null,
    /**
     * @private
     * @type {Object}
     */
    _sharedSchema : null,
    /**
     * @protected
     * @type {Boolean}
     */
    _casting : true,
    /**
     * @protected
     * @type {Object}
     */
    _service : null,
    /**
     * Create a new Model-Instance
     * @construct
     * @param {String|Number} id
     */
    constructor : function (id) {
        var url = this.url,
            localSchema = schemas.getSchema(url),
            sharedSchema = schemas.getSchema(url, "shared"),
            service;

        this._ids = {};
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
     * reset the model to the initial state
     * resetting all attributes...
     *
     * @return {Model} this
     */
    reset : function () {
        this._acceptedAttributes = this._defaults ? Object.create(this._defaults) : {};
        this._attributes = Object.create(this._acceptedAttributes);

        return this;
    },
    /**
     * get ID of active model
     *
     * @param {String=} modelUrl
     * @return {String}
     */
    getId : function (modelUrl) {

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
     * @param {String} modelUrl
     * @param {String|Number=} id
     * @return {Model} this
     */
    setId : function (modelUrl, id) {

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
     * set ids of parent models
     *
     * @param {Object} ids
     * @return {Model} this
     */
    setIds : function (ids) {

        //always keep the model id if not passed
        if (ids[this._url] === undefined) {
            ids[this._url] = this._ids[this._url];
        }
        this._ids = _(ids).clone();

        return this;
    },
    /**
     * get ids of parent models
     * @return {Object}
     */
    getIds : function () {
        return this._ids;
    },
    /**
     * set the model-url
     * @param {String} url
     */
    setUrl : function (url) {
        this._url = url;
    },
    /**
     * get the model-url
     * @return {String}
     */
    getUrl : function () {
        return this._url;
    },

    /**
     * Returns the resource's url generated from the url and ids, e.g. "/post/23/comment/35"
     * @returns {String}
     */
    getResourceUrl : function () {
        return this.Class.getResourceUrl(this._ids);
    },

    /**
     * Set Schema to be used with model. Setting a schema always resets all attributes (but no ids).
     * If no schema is passed, the schema will be auto-loaded.
     * A local schema always overrides the shared schema.
     *
     * @param {Object} schema
     * @param {String="shared"} schemaType shared/local
     * @return {Model} this
     */
    setSchema : function (schema, schemaType) {

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
    getSchema : function (schemaType) {
        if (schemaType === "local") {
            return this._localSchema;
        } else {
            return this._sharedSchema;
        }
    },
    /**
     * set the service the model should use
     *
     * @param {Object|Function} service
     * @return {Model} this
     */
    setService : function (service) {
        this._service = service;

        return this;
    },
    /**
     * get the service that's bound to the model
     * @return {Object|Function}
     */
    getService : function () {
        return this._service;
    },
    /**
     * Set a single or multiple values
     *
     * use like .set("name", "octo");
     * or
     * .set({ name: "octo", age: 3 });
     *
     * NOTE: attributes "id" and "ids" will be ignored
     * use setId or setIds in order to set them
     *
     * @param {String|Object} key
     * @param {*=} value
     */
    set : function (key, value) {
        var map,
            mapKey;

        //setting multiple at once
        if (arguments.length === 1 && typeof key === 'object') {
            map = key;
            for (mapKey in map) {
                if (map.hasOwnProperty(mapKey)) {
                    setAttribute(this, mapKey, map[mapKey]);
                }
            }
        } else {
            setAttribute(this, key, value);
        }

        this.emit('change');

        return this;
    },
    /**
     * return a specific key of the model or all keys at once
     * use like
     * .get("name") to retrieve just the name.
     * or
     * .get() to retrieve all model-attributes as object
     *
     * @param {String=} key
     * @return {Object}
     */
    get : function (key) {
        return getAttributes(this, arguments, dontEscape);
    },
    /**
     * Escape a given attribute or all attributes at once
     * Function returns the given attributes
     * @param {String=} key
     * @return {Object}
     */
    escape : function (key) {
        return getAttributes(this, arguments, escaper);
    },
    /**
     * Unset the given key and revert it to the last accepted state.
     * You can pass many keys at once to unset multiple keys.
     * If you pass no key, all keys will be unset.
     *
     * @param {String} key
     * @return {Model} this
     */
    unset : function (key) {
        var attributes = this._attributes,
            keys = arguments,
            i;

        if (arguments.length === 0) {
            keys = _(attributes).keys();
        }

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            delete this._attributes[key];
        }

        this.emit("change");

        return this;
    },
    /**
     * accept the current state of the model
     * the accepted state is used to determine changed fields
     * since the last change
     * function gets called automatically on successful fetch/save/destroy
     *
     * @return {Model} this
     */
    accept : function () {
        var key,
            value,
            attributes = this._attributes,
            lastState = this._acceptedAttributes;

        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                value = attributes[key];
                lastState[key] = value;
                delete attributes[key];
            }
        }

        return this;
    },
    /**
     * Check if value equals the default value
     *
     * @param {String=} key
     */
    isDefault : function (key) {
        var result = false,
            attributes = this._attributes,
            defaults = this._defaults,
            argsLength = arguments.length,
            arr,
            i, l;

        if (argsLength === 0) {
            arr = this._keys;
        }
        else {
            arr = arguments;
        }

        for (i = 0, l = arr.length; i < l; i++) {
            key = arr[i];
            result = attributes[key] === defaults[key];
            if (!result) {
                break;
            }
        }

        return result;
    },
    /**
     * return all keys of the model-fields as an array
     * @returns {Array}
     */
    getKeys : function () {
        return this._keys;
    },
    /**
     * returns the default-values
     * @return {Object}
     */
    getDefaults : function () {
        return this._defaults;
    },
    /**
     * return all the fields that have changed since the last "accept" call
     * @returns {Object}
     */
    getChanged : function () {

        var key,
            result = {},
            attributes = this._attributes,
            lastState = this._acceptedAttributes;

        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                if (attributes[key] !== lastState[key]) {
                    result[key] = attributes[key];
                }
            }
        }

        return result;
    },
    /**
     * check if a attribute or multiple attributes have changed
     * since last "accept"
     * @param {String} key
     * @returns {boolean}
     */
    hasChanged : function (key) {

        var result = false,
            attributes = this._attributes,
            acceptedAttributes = this._acceptedAttributes,
            argsLength = arguments.length,
            arr,
            i, l;

        if (argsLength === 0) {
            arr = this._keys;
        }
        else {
            arr = arguments;
        }

        for (i = 0, l = arr.length; i < l; i++) {
            key = arr[i];
            result = attributes[key] !== acceptedAttributes[key];
            if (result === true) {
                break;
            }
        }

        return result;
    },
    /**
     * Get the object-re-presentation of the model
     * Object contains id, ids and all model-attributes
     * Options example:
     * {
     *      exclude: ["secretField"],
     *      idAttribute: "_id",
     *      changedOnly: true
     * }
     *
     * @param {Object=} options
     * @return {Object}
     */
    toObject : function (options) {
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
            (options.schemaType === "local" ? this._localSchema : this._sharedSchema) :
            false;

        obj = changedOnly ? this.getChanged() : this.get();

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
     * to be used by JSON.stringify
     * alias for .toObject() without options
     * Model contains id, ids and all model-attributes
     *
     * @return {Object}
     */
    toJSON : function () {
        return this.toObject();
    },
    /**
     * Validate the Model on client- and server-side
     *
     * @param {Boolean=true} remote Pass false if you want to disable remote-validation
     * @param {Function=noop} callback
     */
    validate : function (remote, callback) {
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
    fetch : function (remote, callback) {

        var self = this,
            id = this.getId();

        if (typeof remote === "function") {
            callback = arguments[0];
        }
        callback = typeof callback === "function"? callback : noop;
        remote = typeof remote === "boolean"? remote : true;

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
                self.emit("fetch");
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
    save : function (remote, callback) {

        var id = this.getId(),
            self = this,
            method = "update";

        if (typeof remote === "function") {
            callback = arguments[0];
        }
        callback = typeof callback === "function"? callback : noop;
        remote = typeof remote === "boolean"? remote : true;

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
    destroy : function (remote, callback) {
        var id = this.getId(),
            self = this;

        if (typeof remote === "function") {
            callback = arguments[0];
        }
        callback = typeof callback === "function"? callback : noop;
        remote = typeof remote === "boolean"? remote : true;

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
    dispose: function () {
        this.isDisposed = true;
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

/**
 * @param {Model} self
 * @param {String} key
 * @param {*} newValue
 * @private
 */
function setAttribute(self, key, newValue) {
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
    if (self._types) {

        if (self._types[key] === undefined) {
            throw new Error("(alamid) Unknown property '" + key + "'");
        }

        expectedType = self._types[key];
        if (value(expectedType).isSet()) {
            actualType = typeOf(newValue);

            //type-checking
            if (actualType !== expectedType) {
                if (self._casting === false) {
                    throw new TypeError("Cannot set '" + key + "' to " + newValue + ". '" + key + "' must be type of " + expectedType + ".");
                }

                newValue = caster(newValue, actualType, expectedType);
            }
        }
    }

    if (self._setters && self._setters.hasOwnProperty(key)) {
        setters = self._setters[key];

        for (i = 0; i < setters.length; i++) {
            newValue = setters[i].call(newValue, newValue);
        }
    }

    self._attributes[key] = newValue;
}

/**
 * @param {Model} self
 * @param {Array} keys
 * @param {Function=} escaper
 * @return {*}
 * @private
 */
function getAttributes(self, keys, escaper) {
    var attributes = self._attributes,
        result,
        i,
        key;

    escaper = escaper || dontEscape;

    if (keys.length === 1) {
        return escaper(attributes[keys[0]]);
    }
    if (keys.length === 0) {
        keys = self._keys || _(attributes).keys();
    }

    result = {};
    for (i = 0; i < keys.length; i++) {
        key = keys[i];

        if (attributes[key] !== undefined) {
            result[key] = escaper(attributes[key]);
        }
    }

    return result;
}

function noop() {
}
function dontEscape(value) {
    return value;
}

/**
 * @class SaveEvent
 * @extends Event
 */
var SaveEvent = Event.extend("SaveEvent", {
    name : "SaveEvent"
});

/**
 * @class CreateEvent
 * @extends Event
 */
var CreateEvent = Event.extend("CreateEvent", {
    name : "CreateEvent",
    model : null,
    constructor : function (target, model) {
        this._super(target);
        this.model = model;
    }
});

/**
 * @class UpdateEvent
 * @extends Event
 */
var UpdateEvent = Event.extend("UpdateEvent", {
    name : "UpdateEvent",
    model : null,
    constructor : function (target, model) {
        this._super(target);
        this.model = model;
    }
});

/**
 * @class DestroyEvent
 * @extends Event
 */
var DestroyEvent = Event.extend("DestroyEvent", {
    name : "DestroyEvent",
    model : null,
    constructor : function (target, model) {
        this._super(target);
        this.model = model;
    }
});

/**
 * @class ErrorEvent
 * @extends Event
 */
var ErrorEvent = Event.extend("ErrorEvent", {
    name : "ErrorEvent",
    model : null,
    response : null,
    constructor : function (target, model, response) {
        this._super(target);
        this.model = model;
        this.response = response;
    }
});

/**
 * @class DisposeEvent
 * @extends Event
 */
var DisposeEvent = Event.extend("DisposeEvent", {
    name: "DisposeEvent"
});

module.exports = Model;