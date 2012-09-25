"use strict";

var Class = require("nodeclass").Class,
    NodeClass = Class,
    is = require("nodeclass").is,
    EventEmitter = require("./../shared/EventEmitter.class.js"),
    domAdapter = require("./helpers/domAdapter.js"),
    ALAMID = require("./CONSTANTS.js"),
    _ = require("underscore");

var INCUBATOR = typeof document !== "undefined" && document.createElement("div");

/**
 * @extends EventEmitter
 */
var DisplayObject = new Class("DisplayObject", {

    Extends: EventEmitter,

    /**
     * @type {object}
     *
     */
    node: null,

    /**
     * @type {object}
     * @protected
     */
    _nodeMap: {},

    /**
     * @type {object}
     * @protected
     */
    __displayObjectMap: {},

    /**
     * @type {Boolean}
     * @protected
     */
    _isDisplayed: true,

    /**
     * @type {Boolean}
     * @protected
     */
    _isChild: false,

    /**
     * @type {Boolean}
     * @protected
     */
    _isDisposed: false,

    /**
     * Returns a DisplayObject-Class
     *
     * @param {!String} className
     * @param {!Object} descriptor
     * @return {Function}
     * @static
     */
    $define: function (className, descriptor) {
        descriptor.Extends = DisplayObject;

        return new NodeClass(descriptor);
    },

    /**
     * @param {string} template
     * @constructor
     */
    init: function (template) {

        this.Super();

        if (typeof template !== "string" && typeof this.Instance.constructor.template !== "string") {
            throw new Error("(alamid) Cannot create DisplayObject without template(-string).");
        }
        template = template || this.Instance.constructor.template;

        this.__initNode(template);
        this.__initNodeMap();

    },

    /**
     * @return {Boolean}
     */
    isChild: function () {
        return this._isChild;
    },

    /**
     * @return {Boolean}
     */
    isDisplayed: function () {
        return this._isDisplayed;
    },

    /**
     * @param {object.<string, object>} nodeEventMap
     */
    _addNodeEvents: function (nodeEventMap) {

        var self = this;

        /**
         * @param {object.<string : function>} eventMap
         * @param {string} nodeName
         */
        function eventMapIterator(eventMap, nodeName) {

            var node;

            if (self.__isInNodeMap(nodeName)) {

                node = self._nodeMap[nodeName];

                _(eventMap).each(function attachEventsIterator(listener, event) {
                    domAdapter(node).on(event, listener);
                });

            } else { //Throw new Error

                var events = _(eventMap).keys().join(", "),
                    nodes = _(self._nodeMap).keys().join(", ");

                throw new Error(
                    "(alamid) Trying to attach " + events + " to node '" + nodeName +
                        "', but '" + nodeName + "' is not part of the nodeMap. " +
                        "Found nodes in nodeMap: " + nodes + "."
                );
            }

        }

        _(nodeEventMap).each(eventMapIterator);
    },

    /**
     * How to use: displayObjectInstance._append(new DisplayObject()).at("nodeName").
     *
     * @param {!DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    _append: function (displayObject) {

        if (is(displayObject).notInstanceOf(DisplayObject)) {
            throw new TypeError("(alamid) _append() takes only objects kind of DisplayObject.");
        }

        return this._addChild(displayObject);
    },

    /**
     * How to use: displayObjectInstance._prepend(new DisplayObject()).at("nodeName").
     *
     * @param {!DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    _prepend: function (displayObject) {

        if (is(displayObject).notInstanceOf(DisplayObject)) {
            throw new TypeError("(alamid) _prepend() takes only objects kind of DisplayObject.");
        }

        return this._addChild(displayObject, true);
    },

    /**
     * @param displayObject
     * @param {Boolean} prepend
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    _addChild: function (displayObject, prepend) {

        var self = this,
            __at;

            __at = {
            /**
             * @param {String} nodeName
             * @return {DisplayObject}
             */
            at: function (nodeName) {
                var displayObjectParentNode,
                    displayObjectNode,
                    onDestroy,
                    onDispose;

                if (!self.__isInNodeMap(nodeName)) {
                    throw new Error(
                        "(alamid) Can not create node at '" + nodeName + "'. '" +
                            nodeName + "' is not a child node."
                    );
                }

                displayObject.emit("beforeAdd");
                //Get node where given childView should be placed...
                displayObjectParentNode = self._nodeMap[nodeName];
                displayObjectNode = displayObject.getNode();
                //and append or prepend it.
                if (prepend === true) {
                    displayObjectParentNode.insertBefore(displayObjectNode, displayObjectParentNode.firstChild);
                } else {
                    displayObjectParentNode.appendChild(displayObjectNode);
                }

                //Register DisplayObjects for destroy() and dispose()
                self.__addDisplayObject(nodeName, displayObject);

                //"destroy"- and "dispose"-Event will be attached with once to given DisplayObject ...
                onDestroy = function () {
                    self.__removeDisplayObject(nodeName, displayObject);
                    //... so we still need to remove listener for dispose if given DisplayObject calls destroy().
                    displayObject.removeListener("dispose", onDispose);
                };

                onDispose = function () {
                    self.__removeDisplayObject(nodeName, displayObject);
                    //... so we still need to remove listener for destroy if given DisplayObject calls dispose().
                    displayObject.removeListener("destroy", onDestroy);
                };

                displayObject.once("destroy", onDestroy);
                displayObject.once("dispose", onDispose);

                displayObject.emit("add");

                return self.Instance;
            }
        };

        return __at;
    },

    /**
     * @return {DisplayObject}
     */
    display: function (animator) {

        var self = this;

        this.Super.emit("beforedisplay");

        domAdapter(this.node).removeClass(ALAMID.HIDE_CLASS);


        if (typeof animator === "function") {
            animator(this.node, function () {
                self._isDisplayed = true;
                self.Super.emit("display");
            });
        } else {
            self._isDisplayed = true;
            self.Super.emit("display");
        }

        return this.Instance;
    },

    /**
     * @return {DisplayObject}
     */
    hide: function () {

        this.Super.emit("beforehide");

        domAdapter(this.node).addClass(ALAMID.HIDE_CLASS);
        this._isDisplayed = false;

        this.Super.emit("hide");

        return this.Instance;
    },

    /**
     * @return {DisplayObject}
     */
    destroy: function () {

        this.Super.emit("beforeDestroy");

        domAdapter(this.node).destroy();
        this._isChild = false;

        this.Super.once("add", this.__toggleChildState);

        this.Super.emit("destroy", this.Instance);

        return this.Instance;
    },

    /**
     * @return {DisplayObject}
     */
    dispose: function () {

        if (this._isDisposed === false) {

            this.destroy();

            this.Super.emit("beforeDispose");

            _(this._nodeMap).each(function disposeNode(node) {
                domAdapter(node).off();
            });

            this.node = undefined;
            this._nodeMap = undefined;

            this._isChild = false;

            _(this.__displayObjectMap).each(function disposeDisplayObjectCollection(displayObjectCollection) {
                _(displayObjectCollection).each(function disposeDisplayObject(displayObject) {
                    displayObject.dispose();
                });
            });
            this.__displayObjectMap = undefined;

            this.Super.emit("dispose");
            this.Super.removeAllListeners();

            this._isDisposed = true;
        }
    },

    /**
     * @private
     */
    __toggleChildState: function () {
        if (this._isChild) {
            this._isChild = false;
        }

        if (!this._isChild) {
            this._isChild = true;
        }
    },

    /**
     * @param {string} template
     * @private
     */
    __initNode: function (template) {
        INCUBATOR.innerHTML = template;
        this.node = INCUBATOR.firstChild;

        this.Super.once("add", this.__toggleChildState);
    },


    /**
     * Looks up for nodes which were defined with data-node-attribute and add them to nodeMap.
     * @see {DisplayObject.getNodeMap}
     * @protected
     */
    __initNodeMap: function () {
        //Find all own child nodes
        var nodes = domAdapter(this.node).find("[data-node]"),
            self = this;

        function iterator(node) {
            var nodeName = node.getAttribute("data-node");

            self._nodeMap[nodeName] = node;
        }

        _(nodes).each(iterator);
    },

    /**
     * @param {string} nodeName
     * @return {Boolean}
     * @protected
     */
    __isInNodeMap: function (nodeName) {

        var childNodeNames = _(this._nodeMap).keys();

        return _(childNodeNames).indexOf(nodeName) > -1;
    },

    /**
     * @param {String} nodeName
     * @param {DisplayObject} displayObject
     * @private
     */
    __addDisplayObject: function (nodeName, displayObject) {

        if (this.__displayObjectMap[nodeName] === undefined) {
            this.__displayObjectMap[nodeName] = [];
        }

        this.__displayObjectMap[nodeName].push(displayObject);
    },

    /**
     * @param {String} nodeName
     * @param {DisplayObject} displayObject
     * @private
     */
    __removeDisplayObject: function (nodeName, displayObject) {

        function filterIterator(nodeNameDisplayObject) {
            return displayObject !== nodeNameDisplayObject;
        }

        this.__displayObjectMap[nodeName] = (this.__displayObjectMap[nodeName]).filter(filterIterator);
    }

});

module.exports = DisplayObject;