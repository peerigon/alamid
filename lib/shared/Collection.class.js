"use strict";

var Class = require("alamid-class"),
    value = require("value"),
    Base = require("./Base.class.js"),
    _ = require("underscore");

var Collection = Base.extend("Collection", {

    /**
     * @type {Boolean}
     * @public
     */
    muted: false,

    /**
     * @type {Class}
     * @protected
     */
    _Class: null,

    /**
     * @type {Array}
     * @protected
     */
    _elements: null,

    /**
     * @param {Function=Object} Class
     * @param {*=} elements (optional)
     * @constructor
     */
    constructor: function (Class, elements) {
        this._elements = [];
        this._Class = Class || Object;

        if (elements !== undefined) {
            this.push(elements);
        }
    },

    /**
     * @return {Class}
     */
    getClass: function () {
        return this._Class;
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

        if (value(element).notTypeOf(this._Class)) {
            throw new TypeError(
                "(alamid) Unable to set given element: The element is not instance of " + this._Class
            );
        }

        if (this._elements[index] === undefined) {
            isMutated = true;
        }

        this._elements[index] = element;
        this.emit("add", [element], index, isMutated);

        return this;
    },

    /**
     * Returns the removed elements
     * 
     * @param {Number} index
     * @return {*}
     */
    remove: function (index) {
        var removedElement = this._elements[index];

        if (removedElement) {
            this._elements.splice(index, 1);
            this.emit("remove", [removedElement], index, true);
        }

        return removedElement;
    },

    /**
     * Returns the internal array. Changing the array affect the collection.
     * 
     * @return {Array}
     */
    toArray: function () {
        return this._elements;
    },

    /**
     * Removes and returns the last element
     * 
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

        this.emit("remove", [element], popIndex, true);

        return element;
    },

    /**
     * Removes and returns the first element
     *
     * @return {*}
     */
    shift: function () {
        var element = this._elements.shift();

        this.emit("remove", [element], 0, true);

        return element;
    },


    /**
     * Appends the given elements to the array 
     *
     * @param {*} elements
     * @return {Collection}
     */
    push: function (elements) {
        //pushIndex is the index where the first model will be applied to the array.
        //If there are 3 Models in the Collection pushIndex should be 3, because first index of an Array is 0.
        var pushIndex = this._elements.length;

        if (value(elements).typeOf(Collection)) {
            elements = elements.toArray();
        } else {
            if (value(elements).notTypeOf(Array)) {
                elements = [elements];
            }

            if (value(elements).any.notTypeOf(this._Class)) {
                throw new TypeError(
                    "(alamid) Can not push element(s): They're not instance of " + this._Class
                );
            }
        }

        Array.prototype.push.apply(this._elements, elements);
        this.emit("add", elements, pushIndex, true);

        return this;
    },

    /**
     * It is possible to unshift a Collection, an Array containing elements instance of set Class or a single element
     * instance of set Class.
     *
     * @param {*} elements
     * @return {Collection}
     */
    unshift: function (elements) {
        if (value(elements).typeOf(Collection)) {
            elements = elements.toArray();
        } else {
            if (value(elements).notTypeOf(Array)) {
                elements = [elements];
            }

            if (value(elements).any.notTypeOf(this._Class)) {
                throw new TypeError(
                    "(alamid) Can not push element(s): They're not instance of " + this._Class
                );
            }
        }

        Array.prototype.unshift.apply(this._elements, elements);
        this.emit("add", elements, 0, true);

        return this;
    },

    /**
     * Note: This is a Mutator function.
     *
     * @return {Collection}
     */
    reverse: function() {
        this._elements.reverse();
        return this;
    },

    /**
     * @return {Number}
     */
    size: function () {
        return this._elements.length;
    },

    /**
     * @param {Function(*, Number)} iterator
     */
    each: function (iterator) {
        _(this._elements).each(iterator);
    },

    /**
     * @param {Function(*, Number)} filterIterator
     * @return {Array}
     */
    filter: function (filterIterator) {
        return _(this._elements).filter(filterIterator);
    },

    /**
     * @param {Function.<*, Number>} findIterator
     * @return {*}
     */
    find: function (findIterator) {
        return _(this._elements).find(findIterator);
    },

    emit: function () {
        if (this.muted === false) {
            this._super.apply(this, arguments);
        }
    },

    dispose: function () {
        this._elements = null;
        this._Class = null;
        this._super();
    }
});

module.exports = Collection;