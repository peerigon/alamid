"use strict";

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    EventEmitter = require("./../shared/EventEmitter.class.js"),
    domAdapter = require("./domAdapter.js"),
    STATICS = require("./ALAMID_CLIENT_CONST.js"),
    _ = require("underscore");

var INCUBATOR = typeof document !== "undefined" && document.createElement("div");

/**
 * @extends EventEmitter
 */
var DisplayObject = new Class({

    Extends: EventEmitter,

    /**
     * @type {object}
     * @private
     */
    _node: null,

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
    _isAppended: false,

    /**
     * @param {string} template
     * @constructor
     */
    init: function (template) {

        this.Super();

        if (typeof template !== "string" && typeof this.Instance.constructor.template !== "string") {
            throw new Error("(alamid) error: Cannot create DisplayObject without template(-string).");
        }
        template = template || this.Instance.constructor.template;

        this.__initNode(template);
        this.__initNodeMap();

        //@TODO prepareLinks
    },

    /**
     * @return {Boolean}
     */
    isAppended: function () {
        return this._isAppended;
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
                    "(alamid) error: Trying to attach " + events + " to node '" + nodeName +
                        "', but '" + nodeName + "' is not part of the nodeMap. " +
                        "Found nodes in nodeMap: " + nodes + "."
                );
            }

        }

        _(nodeEventMap).each(eventMapIterator);
    },

    /**
     * How to use: displayObjectInstance._append(new displayObjectInstance()).at("nodeName").
     *
     * @param {!DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    _append: function (displayObject) {

        var __at,
            self = this;

        if (is(displayObject).notInstanceOf(DisplayObject)) {
            throw new TypeError("(alamid) type error: ._append() takes only objects kind of DisplayObject.");
        }

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
                        "(alamid) error: Can not create node at '" + nodeName + "'. '" +
                            nodeName + "' is not a child node."
                    );
                }

                displayObject.emit("beforeappend");
                //Get node where given childView should be placed...
                displayObjectParentNode = self._nodeMap[nodeName];
                displayObjectNode = displayObject.getNode();
                //and append it.
                displayObjectParentNode.appendChild(displayObjectNode);
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

                displayObject.emit("append");

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

        domAdapter(this._node).removeClass(STATICS.HIDE_CLASS);


        if (typeof animator === "function") {
            animator(this._node, function () {
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

        domAdapter(this._node).addClass(STATICS.HIDE_CLASS);
        this._isDisplayed = false;

        this.Super.emit("hide");

        return this.Instance;
    },

    /**
     * @return {DisplayObject}
     */
    destroy: function () {

        this.Super.emit("beforedestroy");

        domAdapter(this._node).destroy();
        this._isAppended = false;

        this.Super.once("append", this.__toggleAppendedState);

        this.Super.emit("destroy", this.Instance);

        return this.Instance;
    },

    /**
     * @return {DisplayObject}
     */
    dispose: function () {

        this.Super.emit("beforedispose");

        _(this._nodeMap).each(function disposeNodeMapIterator(node) {
            domAdapter(node).dispose();
        });

        this._node = undefined;
        this._nodeMap = undefined;

        this._isAppended = false;

        _(this.__displayObjectMap).each(function disposeDisplayObjectMapIterator(displayObject) {
            displayObject.dispose();
        });
        this.__displayObjectMap = undefined;

        this.Super.emit("dispose");
        this.Super.removeAllListeners();
    },

    /**
     * @private
     */
    __toggleAppendedState: function () {
        if (this._isAppended) {
            this._isAppended = false;
        }

        if (!this._isAppended) {
            this._isAppended = true;
        }
    },

    /**
     * @param {string} template
     * @private
     */
    __initNode: function (template) {
        INCUBATOR.innerHTML = template;
        this._node = INCUBATOR.firstChild;

        this.Super.once("append", this.__toggleAppendedState);
    },


    /**
     * Looks up for nodes which were defined with data-node-attribute and add them to nodeMap.
     * @see {DisplayObject.getNodeMap}
     * @protected
     */
    __initNodeMap: function () {
        //Find all own child nodes
        var nodes = domAdapter(this._node).find("[data-node]"),
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

        if (!this.__displayObjectMap[nodeName]) {
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