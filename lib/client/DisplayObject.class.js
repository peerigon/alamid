"use strict";

var value = require("value"),
    EventEmitter = require("./../shared/EventEmitter.class.js"),
    domAdapter = require("./helpers/domAdapter.js"),
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
     * the css-class to be used for hide
     * @type {String}
     */
    cssClassHide : "hide",

    /**
     * @type {object}
     * @protected
     */
    _nodeMap: null,

    /**
     * @type {object}
     * @protected
     */
    _displayObjectMap: null,

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
        this._displayObjectMap = {};

        this._super();

        if (typeof template !== "string") {
            template = this.template;
        }

        if (typeof template !== "string") {
            throw new Error("(alamid) Cannot create DisplayObject without template(-string).");
        }

        if(this.events !== undefined) {
            this._addNodeEvents(this.events);
        }

        this._initNode(template);
        this._initNodeMap();

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

            if (self._isInNodeMap(nodeName)) {

                node = self._nodeMap[nodeName];
                _(eventMap).each(function attachEventsIterator(listener, event) {

                    if(value(listener).typeOf(String)) {
                        listener = self[listener] = self[listener].bind(self);
                    }

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

        if (value(displayObject).notTypeOf(DisplayObject)) {
            throw new TypeError("(alamid) _prepend() takes only objects kind of DisplayObject.");
        }

        return this._addChild(displayObject, true);
    },

    /**
     * @param displayObject
     * @param {Boolean} prepend
     * @return {Object.<string, function(string): DisplayObject>}
     * @private
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
                    displayObjectNode;

                //"destroy"- and "dispose"-Event will be attached with once to given DisplayObject ...
                function onDestroy() {
                    self._removeDisplayObject(nodeName, displayObject);
                    //... so we still need to remove listener for dispose if given DisplayObject calls destroy().
                    displayObject.removeListener("dispose", onDispose);
                }

                function onDispose() {
                    self._removeDisplayObject(nodeName, displayObject);
                    //... so we still need to remove listener for destroy if given DisplayObject calls dispose().
                    displayObject.removeListener("destroy", onDestroy);
                }

                if (!self._isInNodeMap(nodeName)) {
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
                self._addDisplayObject(nodeName, displayObject);

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

        var self = this,
            isHidden = !this.isDisplayed();

        if (isHidden) {
            this.emit("beforedisplay");
        }

        domAdapter(this.node).removeClass(this.cssClassHide);

        if (typeof animator === "function") {
            animator(this.node, function () {
                self._isDisplayed = true;
                if (isHidden) {
                    self.emit("display");
                }
            });
        } else {
            self._isDisplayed = true;
            if (isHidden) {
                self.emit("display");
            }
        }

        return this;
    },

    /**
     * @return {DisplayObject}
     */
    hide: function () {

        var isDisplayed = this.isDisplayed();

        if (isDisplayed) {
            this.emit("beforehide");
        }

        domAdapter(this.node).addClass(this.cssClassHide);
        this._isDisplayed = false;

        if (isDisplayed) {
            this.emit("hide");
        }

        return this;
    },

    /**
     *
     * @param state {Boolean} force display with true
     * @return {DisplayObject}
     */
    toggle : function (state) {

        var node = domAdapter(this.node);

        if(state !== undefined) {
            if(state === true) {
                return this.display();
            }
            else {
                return this.hide();
            }
        }

        if(this.isDisplayed()) {
            return this.hide();
        }

        return this.display();
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

            _(this._displayObjectMap).each(function disposeDisplayObjectCollection(displayObjectCollection) {
                _(displayObjectCollection).each(function disposeDisplayObject(displayObject) {
                    displayObject.dispose();
                });
            });
            this._displayObjectMap = null;

            this.emit("dispose");
            this.removeAllListeners();

            this._isDisposed = true;
        }
    },

    /**
     * @param {string} template
     * @private
     */
    _initNode: function (template) {
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
    _initNodeMap: function () {
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
    _isInNodeMap: function (nodeName) {

        var childNodeNames = _(this._nodeMap).keys();

        return _(childNodeNames).indexOf(nodeName) > -1;
    },

    /**
     * @param {String} nodeName
     * @param {DisplayObject} displayObject
     * @private
     */
    _addDisplayObject: function (nodeName, displayObject) {

        if (this._displayObjectMap[nodeName] === undefined) {
            this._displayObjectMap[nodeName] = [];
        }

        this._displayObjectMap[nodeName].push(displayObject);
    },

    /**
     * @param {String} nodeName
     * @param {DisplayObject} displayObject
     * @private
     */
    _removeDisplayObject: function (nodeName, displayObject) {

        function filterIterator(nodeNameDisplayObject) {
            return displayObject !== nodeNameDisplayObject;
        }

        this._displayObjectMap[nodeName] = _(this._displayObjectMap[nodeName]).filter(filterIterator);
    }

});

module.exports = DisplayObject;