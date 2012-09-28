"use strict";

var Class = require("nodeclass").Class,
    Nodeclass = Class,
    is = require("nodeclass").is,
    EventEmitter = require("./EventEmitter.class.js"),
    _ = require("underscore");

var Collection = new Class("Collection", {

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
     * @param {!String} className
     * @param {!Object} descriptor
     * @return {Function}
     */
    $define: function (className, descriptor) {

        descriptor.Extends = Collection;

        return new Nodeclass(className, descriptor);
    },

    /**
     * @param {Class}
     * @param {*} elements (optional)
     *
     * @constructor
     */
    init: function (Class, elements) {

        this.Super();

        if (typeof(Class) !== "function") {
            throw new Error(
                "(alamid) Cannot construct Collection. Class of elements was not defined as first argument."
            );
        }
        this._Class = Class;

        if (elements !== undefined) {
            this.push(elements);
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
     * @param {*} elements
     * @return {Collection}
     */
    push: function (elements) {
        //pushIndex is the index where the first model will be applied to the array.
        //If there are 3 Models in the Collection pushIndex should be 3, because first index of an Array is 0.
        var pushIndex = this._elements.length,
            self = this;

        if (is(elements).instanceOf(Collection)) {
            elements = elements.toArray();
        } else {
            //make models iterable
            if (_(elements).isArray() === false) {
                elements = [elements];
            }

            _(elements).each(function pushModel(element, index) {
                if (is(element).notInstanceOf(self._Class)) {
                    throw new TypeError(
                        "(alamid) Can not push element (at index: " + index + "). Wrong type of model."
                    );
                }
            });
        }

        Array.prototype.push.apply(this._elements, elements);

        this._emitEvent("add", elements, pushIndex, true);

        return this.Instance;
    },

    /**
     * It is possible to unshift a Collection, an Array containing elements instance of set Class or a single element
     * instance of set Class.
     *
     * @param {*} elements
     * @return {Collection}
     */
    unshift: function (elements) {

        var self = this;

        if (is(elements).instanceOf(Collection)) {
            elements = elements.toArray();
        } else {
            //make models iterable
            if (_(elements).isArray() === false) {
                elements = [elements];
            }

            _(elements).each(function unshiftModel(element, index) {
                if (is(element).notInstanceOf(self._Class)) {
                    throw new TypeError(
                        "(alamid) Can not unshift element (at index: " + index + "). Wrong type of model."
                    );
                }
            });
        }

        Array.prototype.unshift.apply(this._elements, elements);

        this._emitEvent("add", elements, 0, true);

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