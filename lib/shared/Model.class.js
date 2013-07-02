"use strict";

var value = require("value"),
    Base = require('./Base.class.js'),
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
    Event = require("./Event.class.js");

/** @typedef {{ model: Model }} */
var ModelUpdateEvent,
    /** @typedef {{ parentIds: Object, model: Model, data : Object }} */
        ModelCreateEvent,
    /** @typedef {{ model: Model }} */
        ModelDestroyEvent;

var extend,
    slice = Array.prototype.slice;

/**
 * @class Model
 * @type {Class}
 * @extends Base
 */
var Model = Base.extend("Model", {

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
     * @type {Function}
     */
    _defaults : null,
    /**
     * @private
     * @type {Function}
     */
    _attributes : null,
    /**
     * @private
     * @type {Function}
     */
    _acceptedAttributes : null,
    /**
     * @private
     * type : {Object}
     */
    _schema : null,
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
            schema = schemas.getSchema(url),
            sharedSchema = schemas.getSchema(url, "shared"),
            service;

        this._ids = {};
        this._url = url;

        if (value(id).isSet()) {
            this.setId(id);
        }

        if (schema || sharedSchema) {
            //load schemas
            if (schema !== null) {
                this.setSchema(schema);
            }
            if (sharedSchema !== null) {
                this.setSchema(sharedSchema, "shared");
            }
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
     */
    reset : function () {
        function Attributes() {}

        function AcceptedAttributes() {}

        AcceptedAttributes.prototype = this._defaults;

        this._acceptedAttributes = Attributes.prototype = new AcceptedAttributes();
        this._attributes = new Attributes();
    },
    /**
     * get ID of active model
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
     * @param {String} modelUrl
     * @param {String|!Number} id
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
     * @param {Object} ids
     */
    setIds : function (ids) {

        //always keep the model id if not passed
        if (ids[this._url] === undefined) {
            ids[this._url] = this._ids[this._url];
        }
        this._ids = _(ids).clone();
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
     * @return {String|_url}
     */
    getUrl : function () {
        return this._url;
    },

    getResourceUrl: function () {
        return this.Class.getResourceUrl(this._ids);
    },

    /**
     * set Schema to be used with model
     * if no schema is passed, the schema will be auto-loaded
     * @param {Object} schema
     * @param {String} schemaType (optional) shared
     */
    setSchema : function (schema, schemaType) {

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
     * @param {Object|Function} service
     */
    setService : function (service) {
        this._service = service;
    },
    /**
     * get the service that's bound to the model
     * @return {Object|_service}
     */
    getService : function () {
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
     * @param {String} key
     * @return {*}
     */
    get : function (key) {
        return getAttributes(this, arguments, dontEscape);
    },
    /**
     * Escape a given attribute or all attributes at once
     * Function returns the given attributes
     * @param {String} key
     * @return {*}
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
    },
    /**
     * accept the current state of the model
     * the accepted state is used to determine changed fields
     * since the last change
     * function gets called automatically on successful fetch/save/destroy
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
    },
    /**
     * Check if value equals the default value
     *
     * @param {String} key
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
     * @returns {Array|_keys}
     */
    getKeys : function() {
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
     * @returns {{}}
     */
    getChanged : function() {

        var key,
            result = {},
            attributes = this._attributes,
            lastState = this._acceptedAttributes;

        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {

                if(attributes[key] !== lastState[key]) {
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
    hasChanged : function(key) {

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
     * options example: { exclude : ["secretField"], idAttribute : "_id" }
     *
     * @param {Object=} options
     * @return {*}
     */
    toObject : function (options) {
        var obj = this.get(),
            key,
            idAttribute,
            exclude;

        options = options || {};
        exclude = options.exclude || [];
        idAttribute = options.idAttribute || "id";

        obj[idAttribute] = this.getId();
        obj.ids = this.getIds();

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {

                //hide undefined fields, but never hide id
                if (obj[key] === undefined && key !== idAttribute) {
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
     * alias for toObject
     * Model contains id, ids and all model-attributes
     *
     * @return {*}
     */
    toJSON : function () {
        return this.toObject();
    },
    /**
     * Validate the Model on client- and serverside
     *
     * @param {Boolean} remote Pass false if you want to disable remote-validation
     * @param {Function} callback
     */
    validate : function (remote, callback) {
        var schema = this._schema,
            sharedSchema = this._sharedSchema;

        if (arguments.length === 1) {
            callback = arguments[0];
            remote = true;
        }

        callback = callback || noop;

        if (schema !== null && sharedSchema !== null) {
            validate(sharedSchema, schema, this._url, this.toObject(), remote, callback);
        } else {
            throw new Error("(alamid) No schema defined for model '" + this._url + "'");
        }
    },
    /**
     * Fetch the data for the model from the defined service (client and/or server)
     * Fetch only works for models with existing IDs
     *
     * @param {Boolean} remote  contact remoteService, defaults to true
     * @param {Function} callback
     */
    fetch : function (remote, callback) {

        var self = this,
            id = this.getId();

        if (arguments.length === 1) {
            callback = arguments[0];
            remote = true;
        }

        callback = callback || noop;

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
                Class.emit("error", new ErrorEvent(Class, self, response));
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
     * @param {Boolean} remote should a remote service be contacted (defaults to true)
     * @param {Function} callback
     */
    save : function (remote, callback) {

        var id = this.getId(),
            self = this,
            method = "update";

        if (arguments.length === 1) {
            callback = arguments[0];
            remote = true;
        }

        callback = callback || noop;

        if (id === null || typeof id === "undefined") {
            method = "create";
        }

        serviceAdapter(self, method, remote, function onServiceResponse(err, response) {
            var Class = self.Class,
                cache = Class.cache;

            if (err) {
                Class.emit("error", new ErrorEvent(Class, self, response));
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
     * @param {Boolean} remote
     * @param {Function} callback
     */
    destroy : function (remote, callback) {
        var id = this.getId(),
            self = this;

        if (arguments.length === 1) {
            callback = arguments[0];
            remote = true;
        }

        callback = callback || noop;

        if (value(id).isNotSet()) {
            callback(new Error("(alamid) Cannot destroy model: You have to set an ID."));
            return;
        }

        serviceAdapter(self, "destroy", remote, function onServiceResponse(err, response) {
            var Class = self.Class,
                cache = Class.cache;

            if (err) {
                Class.emit("error", new ErrorEvent(Class, self, response));
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
    }
});

extend = Model.extend;
Model.extend = function () {
    var Class = extend.apply(Model, arguments),
        url;

    Base.mixin(Class);
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
Base.mixin(Model);

/**
 * @param {Model} self
 * @param {String} key
 * @param {*} newValue
 * @private
 */
function setAttribute(self, key, newValue) {
    var expectedType,
        actualType;

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

        if(attributes[key] !== undefined) {
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
    name: "SaveEvent"
});

/**
 * @class CreateEvent
 * @extends Event
 */
var CreateEvent = Event.extend("CreateEvent", {
    name: "CreateEvent",
    model: null,
    constructor: function (target, model) {
        this._super(target);
        this.model = model;
    }
});

/**
 * @class UpdateEvent
 * @extends Event
 */
var UpdateEvent = Event.extend("UpdateEvent", {
    name: "UpdateEvent",
    model: null,
    constructor: function (target, model) {
        this._super(target);
        this.model = model;
    }
});

/**
 * @class DestroyEvent
 * @extends Event
 */
var DestroyEvent = Event.extend("DestroyEvent", {
    name: "DestroyEvent",
    model: null,
    constructor: function (target, model) {
        this._super(target);
        this.model = model;
    }
});

/**
 * @class ErrorEvent
 * @extends Event
 */
var ErrorEvent = Event.extend("ErrorEvent", {
    name: "ErrorEvent",
    model: null,
    response: null,
    constructor: function (target, model, response) {
        this._super(target);
        this.model = model;
        this.response = response;
    }
});

module.exports = Model;