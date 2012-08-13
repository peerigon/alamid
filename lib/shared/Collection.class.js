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
     * @param {Class}
     * @param {Collection|array.<Class>|Class} models (optional
     *
     * @constructor
     */
    init: function (Class, models) {

        this.Super();

        if (Class === undefined) {
            throw new Error(
                "(alamid) Cannot construct Collection. Class of elements was not defined as first argument."
            );
        }
        this._Class = Class;

        if (models !== undefined) {
            this.push(models);
        }

    },

    getClass: function () {
        return this._Class;
    },

    /**
     * @param {boolean} isMuted
     * @return {Collection}
     */
    setMuted: function (isMuted) {
        this._isMuted = isMuted;
        return this.Instance;
    },

    /**
     * @param {Number} index
     * @return {*}
     */
    get: function (index) {
        return this._elements[index];
    },

    /**
     * @param {Number} index
     * @param element
     * @return {Collection}
     */
    set: function (index, element) {

        var isMutated = false;

        //It is not possible to set an negative index on Arrays.
        if (index < 0) {
            throw new Error(
                "(alamid) Tried to set invalid index. Index must be >= 0, but " + index + " given."
            );
        }

        if (is(element).notInstanceOf(this._Class)) {
            throw new TypeError(
                "(alamid) Unable to set given model. Model is not instance of set ModelClass."
            );
        }

        if (this._elements[index] === undefined) {
            isMutated = true;
        }

        this._elements[index] = element;
        this._emitEvent("add", [element], index, isMutated);

        return this.Instance;
    },

    /**
     * @return {array.<*>}
     */
    toArray: function () {
        return this._elements;
    },

    /**
     * @return {*}
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

        this._emitEvent("remove", [element], popIndex, true);

        return element;
    },

    /**
     * @return {*}
     */
    shift: function () {

        var element = this._elements.shift();

        this._emitEvent("remove", [element], 0, true);

        return element;
    },


    /**
     * It is possible to push a Collection, an Array containing elements instance of set Class or a single element
     * instance of set Class.
     *
     * @param {Collection|array.<Class>|Class} models
     * @return {Collection}
     */
    push: function (models) {
        //pushIndex is the index where the first model will be applied to the array.
        //If there are 3 Models in the Collection pushIndex should be 3, because first index of an Array is 0.
        var pushIndex = this._elements.length,
            self = this;

        if (is(models).instanceOf(Collection)) {
            models = models.toArray();
        } else {
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
        }

        Array.prototype.push.apply(this._elements, models);

        this._emitEvent("add", models, pushIndex, true);

        return this.Instance;
    },

    /**
     * It is possible to unshift a Collection, an Array containing elements instance of set Class or a single element
     * instance of set Class.
     *
     * @param {Collection|array.<Class>|Class} models
     * @return {Collection}
     */
    unshift: function (models) {

        var self = this;

        if (is(models).instanceOf(Collection)) {
            models = models.toArray();
        } else {
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
        }

        Array.prototype.unshift.apply(this._elements, models);

        this._emitEvent("add", models, 0, true);

        return this.Instance;
    },

    /**
     * @return {Collection}
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
     * @param {function(*, number)} iterator
     */
    each: function (iterator) {
        _(this._elements).each(iterator);
    },

    /**
     * @param {function.<*, number>} filterIterator
     * @return {array.<*>}
     */
    filter: function (filterIterator) {
        return _(this._elements).filter(filterIterator);
    },

    /**
     * @param {string} eventName
     * @param {*} arg1
     * @param {*} arg2
     * @param {*} arg3
     * @param {*} arg4
     * @protected
     */
    _emitEvent: function (eventName, arg1, arg2, arg3, arg4) {
        if (this._isMuted === false) {
            this.Super.emit(eventName, arg1, arg2, arg3, arg4);
        }
    }

});

module.exports = Collection;