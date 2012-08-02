"use strict";

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    EventEmitter = require("./EventEmitter.class.js"),
    _ = require("underscore");

var Collection = new Class({

    Extends: EventEmitter,

    /**
     * @type {boolean}
     * @protected
     */
    _isMuted: false,

    /**
     * @type {Class}
     * @protected
     */
    _Class: null,

    /**
     * @type {array}
     * @protected
     */
    _elements: [],

    /**
     * @param {Class} ModelClass
     * @param {array|Model} models
     * @constructor
     */
    init: function (Class, models) {

        this.Super();

        if (Class !== undefined) {
            this._Class = Class;
        }

        if (models !== undefined) {
            this.push(models);
        }

    },

    getClass: function () {
        return this._Class;
    },

    /**
     * @param {boolean}isMuted
     * @return {ModelCollection}
     */
    setMuted: function (isMuted) {
        this._isMuted = isMuted;
        return this.Instance;
    },

    /**
     * @param {Number} index
     * @return {Model}
     */
    get: function (index) {
        return this._elements[index];
    },

    /**
     * @param {Number} index
     * @param element
     * @return {ModelCollection}
     */
    set: function (index, element) {
        if (is(element).notInstanceOf(this._Class)) {
            throw new TypeError(
                "(alamid) Unable to set given model. Model is not instance of set ModelClass."
            );
        }

        this._elements[index] = element;
        this._emitEvent("add", index, [element], 1);

        return this.Instance;
    },

    /**
     * @return {array.<mixed>}
     */
    toArray: function () {
        return this._elements;
    },

    /**
     * @return {mixed}
     */
    pop: function () {

        var popIndex,
            element;

        if (this._elements.length === 0) {
            popIndex = 0;
        } else {
            popIndex = this._elements.length - 1;
        }

        element = this._elements.pop();

        this._emitEvent("remove", popIndex, [element], 1);

        return element;
    },

    /**
     * @return {mixed}
     */
    shift: function () {

        var element = this._elements.shift();

        //model.removeListener("change", this._emitChange);

        this._emitEvent("remove", 0, [element], 1);

        return element;
    },


    /**
     * @param {array|Model} models
     * @return {ModelCollection}
     */
    push: function (models) {
        //pushIndex is the index where the first model will be applied to the array.
        //If there are 3 Models in the Collection pushIndex should be 3, because first index of an Array is 0.
        var pushIndex = this._elements.length,
            self = this;

        //make models iterable
        if (_(models).isArray() === false) {
            models = [models];
        }

        _(models).each(function pushModel(model, index) {
            if (is(model).notInstanceOf(self._Class)) {
                throw new TypeError(
                    "(alamid) Can not push model (at index: " + index + "). Wrong type of model."
                );
            }
        });

        Array.prototype.push.apply(this._elements, models);

        this._emitEvent("add", pushIndex, models, models.length);

        return this.Instance;
    },

    /**
     * @param {array|Model} models
     * @return {ModelCollection}
     */
    unshift: function (models) {

        var self = this;
        //make models iterable
        if (_(models).isArray() === false) {
            models = [models];
        }

        _(models).each(function unshiftModel(model, index) {
            if (is(model).notInstanceOf(self._Class)) {
                throw new TypeError(
                    "(alamid) Can not unshift model (at index: " + index + "). Wrong type of model."
                );
            }
        });

        Array.prototype.unshift.apply(this._elements, models);

        this._emitEvent("add", 0, models, models.length);

        return this.Instance;
    },

    /**
     * @return {ModelCollection}
     */
    reverse: function() {
        this._elements.reverse();

        return this.Instance;
    },

    /**
     * @return {Number}
     */
    size: function () {
        return this._elements.length;
    },

    /**
     * @param {function.<mixed, number>} iterator
     */
    each: function (iterator) {
        _(this._elements).each(iterator);
    },

    /**
     * @param {function.<mixed, number>} filterIterator
     * @return {array}
     */
    filter: function (filterIterator) {
        return _(this._elements).filter(filterIterator);
    },

    /**
     * @param {string} eventName
     * @param {mixed} arg1
     * @param {mixed} arg2
     * @param {mixed} arg3
     * @param {mixed} arg4
     * @protected
     */
    _emitEvent: function (eventName, arg1, arg2, arg3, arg4) {
        if (this._isMuted === false) {
            this.Super.emit(eventName, arg1, arg2, arg3, arg4);
        }
    }

});

module.exports = Collection;