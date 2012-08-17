"use strict";

var nodeclass = require("nodeclass"),
    is = nodeclass.is,
    Class = nodeclass.Class,
    NodeClass = nodeclass.Class,
    EventEmitter = require('./EventEmitter.class.js'),
    modelStatics = require("./modelStatics.js");

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

/**
 * @class Model
 * @type {nodeclass.Class}
 * @extends EventEmitter
 */
var Model = new Class({

    Extends: EventEmitter,

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
     * @name Model#delete
     */

    /**
     * @event
     * @name Model#save
     */

    /**
     * @private
     * @type {Object}
     */
    __parentIds: {},
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
     * @type {String|Number}
     */
    _id: null,
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
    init: function init(id) {

        this._id = this.__setId(id || null);
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
    __setId : function(id) {
        if(this.__parentIds[this.__url] === undefined) {
            this.__parentIds[this.__url] = id;
        }
        return this._id = id;
    },
    /**
     * get ID of active model
     * @return {String}
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
     * @param {!Object} response
     * @return {Error} err
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
                this.__setId(id);
            }
            //maybe set parentIds here as well
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
     * @param {String} schemaType (optional) shared
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
    /**
     * set the service the model should use
     * @param {!Object|Function} service
     */
    setService : function(service) {
        //nodeclass or class
        if(typeof service === "function") {
            service = new service();
        }
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
    /**
     * Set a single or multiple values
     *
     * use like .set("name", "octo");
     * or
     * .set({ name : "octo", age : 3 });
     *
     * @param {String|Object} key
     * @param {*} value
     */
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
    /**
     * simple emit proxy taking care of muting
     * @param {!String} event
     */
    emit : function(event) {
        if (!this.muted) {
            this.Super.emit(event);
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
    /**
     * Escape a given attribute or all attributes at once
     * Function returns the given attributes
     * @param {!String} key
     * @return {*}
     */
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
    remove: function remove(key) {
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
    removeAll: function removeAll() {
        this.__reset();
        this.emit('change');
    },
    /**
     * Unset the given key and revert it to the last accepted state
     * You can pass many keys at once to unset multiple keys
     * @param {!String} key
     */
    unset: function unset(key) {
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
    /**
     * Check if a attribute has changed
     * You can check multiple attributes by passing many keys as arguments
     *
     * @param {!String} key
     * @return {Boolean}
     */
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
     * Check if value equals the default value
     * pass true as last argument to enable strict mode
     * strict mode checks if the value is the default value and is initial (has never been changed)
     *
     * @param {!String} key
     * @params {Boolean} strict
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
    /**
     * returns the default-values
     * @return {Object}
     */
    getDefaults: function () {
        return this.__defaults;
    },
    /**
     * Get the object-re-presentation of the model
     *
     * @return {*}
     */
    toObject : function() {
        return this.get();
    },
    /**
     * Get the object-serialized as JSON
     *
     * @return {*}
     */
    toJSON: function () {
        return JSON.stringify(this.get());
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

        if(schema !== null && sharedSchema !== null) {
            validate(sharedSchema, schema, this.__url, this.get(), remote, callback);
        }
        else{
            throw new Error("(alamid) No schema defined for model");
        }
    },
    /**
     * Call the passed service function with the given params
     * This functions takes care of sync and async service-definition
     *
     * @param {Function} serviceFunction
     * @param {Boolean} remote
     * @param {Object} model
     * @param {Object} ids
     * @param {Object} data
     * @param {Function} callback
     * @private
     */
    __callService : function(serviceFunction, remote, model, ids, data, callback) {

        var args = Array.prototype.slice.call(arguments, 0);
        //the last param is callback dude!
        callback = args[args.length-1];

        //remove the first element, because it's the function itself
        args.splice(0, 1);

        //we don't have remote on server-services!
        if(config.isServer) {
            args.splice(0, 1);
        }

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
    /**
     * Fetch the data for the model from the defined service (client and/or server)
     * Fetch only works for models with existing IDs
     *
     * @param {Boolean} remote  contact remoteService, defaults to true
     * @param {function(err)} callback
     */
    fetch: function fetch(remote, callback) {
        var service = this._service,
            id = this._id,
            self = this;

        if(arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

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

        this.__callService(service.read, remote, this.__ids, onServiceResponse);
    },
    /**
     * Save or Update Model depending on an ID being set or not
     *
     * @param {Boolean} remote should a remote service be contacted (defaults to true)
     * @param {function(err)} callback
     */
    save: function save(remote, callback) {

        var service = this._service,
            id = this._id,
            self = this,
            method = "update";

        if(arguments.length === 1) {
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
            }
            if (!err) {
                //instance has not been part of the registry before -> store new instance
                //cache only for newly CREATED  / update instances should already be cached
                if(method === "create" && modelCache.get(self.__url, id) !== undefined) {
                    modelCache.add(self.Instance);
                }

                self.emit("save");

                //model is always attached for create and update
                event.model = self.Instance;

                if(method === "update") {
                    event.parentIds = response.id; //should be IDs later
                    event.data = response.data;
                }

                self.Instance.constructor.emit(method, event);
            }
            callback(err);
        }

        this.__callService(service[method], remote, this.__ids, this.Instance, onServiceResponse);
    },
    /**
     * Calls the "delete" service, returning the status of the request (err)
     * @param {Boolean} remote
     * @param {!Function} callback
     */
    delete: function (remote, callback) {
        var service = this._service,
            id = this._id,
            self = this;

        if(arguments.length === 1) {
            callback = arguments[0] || noop;
            remote = true;
        }

        function onServiceResponse(response) {
            var err,
                event = {};

            try {
                err = self.__processResponse(response);
            } catch (err) {
                err.message = "(alamid) Error while deleting the model: " + err.message;
            }
            if (!err) {
                self.emit("delete");

                event.model = self.Instance;

                self.Instance.constructor.emit("delete", event);
            }
            callback(err);
        }

        if (!service) {
            callback(new Error("(alamid) Cannot delete model: There is no service available."));
            return;
        }
        if (!id) {
            callback(new Error("(alamid) Cannot delete model: You have to set an ID."));
            return;
        }
        this.__callService(service.delete, remote, this.__ids, onServiceResponse);
    },
    /**
     * Accept the current state of the attributes
     * If you have accepted a state, unset will never go beyond this state
     *
     * @private
     */
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
    /**
     * Dispose Model
     * Removes all event listeners
     */
    dispose : function() {
        this.Super.emit("dispose");
        this.Super.removeAllListeners();
    },
    /** Create a new Model based on the Model-Class
     *
     * Model.define("Octocat", {
     *      - your model definition goes here -
     * });
     *
     *
     * @static
     * @param descriptor
     * @return {*}
     */
    $define : function(descriptor) {
        var eventEmitter = new EventEmitter(),
            attribute;

        for(attribute in eventEmitter) {
            if(eventEmitter.hasOwnProperty(attribute)) {
                descriptor["$"+attribute] = eventEmitter[attribute];
            }
        }

        descriptor.Extends = Model;
        descriptor.$find = modelStatics.find;
        descriptor.$findById = modelStatics.findById;
        descriptor.$url = descriptor.$url.toLowerCase();

        return new NodeClass(descriptor);
    }
});

module.exports = Model;