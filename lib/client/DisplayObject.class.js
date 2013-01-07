"use strict";

var value = require("value"),
    EventEmitter = require("./../shared/EventEmitter.class.js"),
    domAdapter = require("./helpers/domAdapter.js"),
    ALAMID = require("./CONSTANTS.js"),
    _ = require("underscore");

/**
 * @extends EventEmitter
 */
var DisplayObject = EventEmitter.extend("DisplayObject", {

    /**
     * @type {object}
     *
     */
    node: null,

    /**
     * @type {object}
     * @protected
     */
    _nodeMap: null,

    /**
     * @type {object}
     * @protected
     */
    __displayObjectMap: null,

    /**
     * @type {Boolean}
     * @protected
     */
    _isDisplayed: true,

    /**
     * @type {Boolean}
     * @protected
     */
    _isDisposed: false,

    /**
     * @param {string} template
     * @constructor
     */
    constructor: function (template) {

        this._nodeMap = {};
        this.__displayObjectMap = {};

        this._super();

        if (typeof template !== "string") {
            template = this.template;
        }

        if (typeof template !== "string") {
            throw new Error("(alamid) Cannot create DisplayObject without template(-string).");
        }

        this.__initNode(template);
        this.__initNodeMap();

    },

    /**
     * @return {Boolean}
     */
    isChild: function () {
        return Boolean(this.node) && this.node.parentNode !== null;
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

        if (value(displayObject).notTypeOf(DisplayObject)) {
            throw new TypeError("(alamid) _append() takes only objects kind of DisplayObject.");
        }

        return this.__addChild(displayObject);
    },

    /**
     * How to use: displayObjectInstance._prepend(new DisplayObject()).at("nodeName").
     *
     * @param {!DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    _prepend: function (displayObject) {

        if (value(displayObject).notTypeOf(DisplayObject)) {
            throw new TypeError("(alamid) _prepend() takes only objects kind of DisplayObject.");
        }

        return this.__addChild(displayObject, true);
    },

    /**
     * @param displayObject
     * @param {Boolean} prepend
     * @return {Object.<string, function(string): DisplayObject>}
     * @private
     */
    __addChild: function (displayObject, prepend) {

        var self = this,
            __at;

            __at = {
            /**
             * @param {String} nodeName
             * @return {DisplayObject}
             */
            at: function (nodeName) {
                var displayObjectParentNode,
                    displayObjectNode;

                //"destroy"- and "dispose"-Event will be attached with once to given DisplayObject ...
                function onDestroy() {
                    self.__removeDisplayObject(nodeName, displayObject);
                    //... so we still need to remove listener for dispose if given DisplayObject calls destroy().
                    displayObject.removeListener("dispose", onDispose);
                }

                function onDispose() {
                    self.__removeDisplayObject(nodeName, displayObject);
                    //... so we still need to remove listener for destroy if given DisplayObject calls dispose().
                    displayObject.removeListener("destroy", onDestroy);
                }

                if (!self.__isInNodeMap(nodeName)) {
                    throw new Error(
                        "(alamid) Can not create node at '" + nodeName + "'. '" +
                            nodeName + "' is not a child node."
                    );
                }

                displayObject.emit("beforeAdd");
                //Get node where given childView should be placed...
                displayObjectParentNode = self._nodeMap[nodeName];
                displayObjectNode = displayObject.node;
                //and append or prepend it.
                if (prepend === true) {
                    displayObjectParentNode.insertBefore(displayObjectNode, displayObjectParentNode.firstChild);
                } else {
                    displayObjectParentNode.appendChild(displayObjectNode);
                }

                //Register DisplayObjects for destroy() and dispose()
                self.__addDisplayObject(nodeName, displayObject);

                displayObject.once("destroy", onDestroy);
                displayObject.once("dispose", onDispose);

                displayObject.emit("add");

                return self;
            }
        };

        return __at;
    },

    /**
     * @return {DisplayObject}
     */
    display: function (animator) {

        var self = this;

        this.emit("beforedisplay");

        domAdapter(this.node).removeClass(ALAMID.HIDE_CLASS);

        if (typeof animator === "function") {
            animator(this.node, function () {
                self._isDisplayed = true;
                self.emit("display");
            });
        } else {
            self._isDisplayed = true;
            self.emit("display");
        }

        return this;
    },

    /**
     * @return {DisplayObject}
     */
    hide: function () {

        this.emit("beforehide");
        domAdapter(this.node).addClass(ALAMID.HIDE_CLASS);
        this._isDisplayed = false;
        this.emit("hide");

        return this;
    },

    /**
     * @return {DisplayObject}
     */
    destroy: function () {

        this.emit("beforeDestroy");
        domAdapter(this.node).destroy();
        this.emit("destroy", this);

        return this;
    },

    dispose: function () {

        if (this._isDisposed === false) {

            this.destroy();
            this.emit("beforeDispose");

            _(this._nodeMap).each(function disposeNode(node) {
                domAdapter(node).off();
            });

            this.node = null;
            this._nodeMap = null;

            _(this.__displayObjectMap).each(function disposeDisplayObjectCollection(displayObjectCollection) {
                _(displayObjectCollection).each(function disposeDisplayObject(displayObject) {
                    displayObject.dispose();
                });
            });
            this.__displayObjectMap = null;

            this.emit("dispose");
            this.removeAllListeners();

            this._isDisposed = true;
        }
    },

    /**
     * @param {string} template
     * @private
     */
    __initNode: function (template) {
        var incubatorNode = document.createElement("div");

        incubatorNode.innerHTML = template;

        if (incubatorNode.childNodes.length > 1) {
            throw new Error(
                "(alamid) Error: Templates must contain only one parent node, " +
                "but template: '" + template + "' contains " + incubatorNode.childNodes.length + "."
            );
        }

        this.node = incubatorNode.removeChild(incubatorNode.firstChild);
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

        this.__displayObjectMap[nodeName] = _(this.__displayObjectMap[nodeName]).filter(filterIterator);
    }

});

module.exports = DisplayObject;