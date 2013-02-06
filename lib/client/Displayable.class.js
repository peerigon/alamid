"use strict";

var value = require("value"),
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Event = require("../shared/Event.class.js"),
    domAdapter = require("./helpers/domAdapter.js"),
    _ = require("underscore");

/**
 * Represents a section of the DOM and provides various methods to manipulate it.
 *
 * @class Displayable
 * @extends EventEmitter
 */
var Displayable = EventEmitter.extend("Displayable", {

    /**
     * @type {Element}
     */
    node: null,

    /**
     * @type {String}
     */
    template: "<div></div>",

    /**
     * the css-class to be used for hide
     * @type {String}
     */
    cssClassHide : "hide",

    /**
     * @type {Object}
     * @private
     */
    _nodeMap: null,

    /**
     * @type {Object}
     * @private
     */
    _displayableMap: null,

    /**
     * @type {Boolean}
     * @private
     */
    _isVisible: true,

    /**
     * @type {Boolean}
     * @private
     */
    _isDisposed: false,

    /**
     * @param {String=} template (default = "<div></div>")
     * @throws {TypeError}
     * @constructor
     */
    constructor: function (template) {
        if (template === undefined) {
            template = this.template;
        }
        if (value(template).notTypeOf(String)) {
            throw new TypeError("(alamid) Cannot create Displayable: Expected a string as template, instead saw '" + template + "'");
        }

        this._super();

        this.template = template;
        this._nodeMap = {};
        this._displayableMap = {};

        if (this.events !== undefined) {
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
    isVisible: function () {
        return this._isVisible;
    },

    /**
     * @param {Object.<String, EventMap>} nodeEventMap
     */
    _addNodeEvents: function (nodeEventMap) {
        _(nodeEventMap).each(this._addEventsToSingleNode, this);
    },

    _addEventsToSingleNode: function (eventMap, nodeName) {
        var node,
            events,
            nodes,
            self = this;

        if (this._isInNodeMap(nodeName)) {

            node = this._nodeMap[nodeName];
            _(eventMap).each(function attachEventsIterator(listener, event) {
                if (value(listener).typeOf(String)) {
                    listener = self[listener] = self[listener].bind(self);
                }

                domAdapter(node).on(event, listener);
            });

        } else {

            events = _(eventMap).keys().join(", ");
            nodes = _(this._nodeMap).keys().join(", ");
            throw new Error(
                "(alamid) Trying to attach " + events + " to node '" + nodeName +
                    "', but '" + nodeName + "' is not part of the nodeMap. " +
                    "Found nodes in nodeMap: " + nodes + "."
            );

        }
    },

    /**
     * How to use: this._append(new Displayable()).at("nodeName").
     *
     * @param {Displayable} displayable
     * @return {Object}
     * @private
     */
    _append: function (displayable) {

        if (value(displayable).notTypeOf(Displayable)) {
            throw new TypeError("(alamid) _append() only takes objects kind of Displayable.");
        }

        return this._addChild(displayable, false);
    },

    /**
     * How to use: this._prepend(new Displayable()).at("nodeName").
     *
     * @param {Displayable} displayable
     * @return {Object}
     * @private
     */
    _prepend: function (displayable) {

        if (value(displayable).notTypeOf(Displayable)) {
            throw new TypeError("(alamid) _prepend() only takes objects kind of Displayable.");
        }

        return this._addChild(displayable, true);
    },

    /**
     * @param {Displayable} displayable
     * @param {Boolean} prepend
     * @return {Object}
     * @private
     */
    _addChild: function (displayable, prepend) {
        Appender.context.self = this;
        Appender.context.target = displayable;
        Appender.context.prepend = prepend;

        return Appender;
    },

    /**
     * @return {Displayable}
     */
    show: function () {
        var self = this,
            isHidden = !this.isVisible();

        if (isHidden) {
            this.emit("beforeShow", new BeforeShowEvent(this));
        }

        domAdapter(this.node).removeClass(this.cssClassHide);

        self._isVisible = true;
        if (isHidden) {
            self.emit("show", new ShowEvent(this));
        }

        return this;
    },

    /**
     * @return {Displayable}
     */
    hide: function () {
        var isDisplayed = this.isVisible();

        if (isDisplayed) {
            this.emit("beforeHide", new BeforeHideEvent(this));
        }

        domAdapter(this.node).addClass(this.cssClassHide);
        this._isVisible = false;

        if (isDisplayed) {
            this.emit("hide", new HideEvent(this));
        }

        return this;
    },

    /**
     *
     * @param state {Boolean} force show with true
     * @return {Displayable}
     */
    toggle : function (state) {

        if (state !== undefined) {
            if (state === true) {
                return this.show();
            } else {
                return this.hide();
            }
        }

        if (this.isVisible()) {
            return this.hide();
        }

        return this.show();
    },

    /**
     * @return {Displayable}
     */
    destroy: function () {

        this.emit("beforeDestroy", new BeforeDestroyEvent(this));
        domAdapter(this.node).destroy();
        this.emit("destroy", new DestroyEvent(this));

        return this;
    },

    /**
     * Removes all DOM events and event listeners and cleans up references.
     */
    dispose: function () {

        if (this._isDisposed === false) {

            this.destroy();
            this.emit("beforeDispose", new BeforeDisposeEvent(this));

            _(this._nodeMap).each(function disposeNode(node) {
                domAdapter(node).off();
            });

            this.node = null;
            this._nodeMap = null;

            _(this._displayableMap).each(function disposeDisplayableCollection(displayableCollection) {
                _(displayableCollection).each(function disposeDisplayable(displayable) {
                    displayable.dispose();
                });
            });
            this._displayableMap = null;

            this._isDisposed = true;
            this.emit("dispose", new DisposeEvent(this));

            this.removeAllListeners();
        }

    },

    /**
     * @param {String} template
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
     * Looks up for nodes which were defined with data-node-attribute and adds them to nodeMap.
     * @private
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
     * @param {String} nodeName
     * @return {Boolean}
     * @private
     */
    _isInNodeMap: function (nodeName) {
        var childNodeNames = _(this._nodeMap).keys();

        return _(childNodeNames).indexOf(nodeName) > -1;
    },

    /**
     * @param {String} nodeName
     * @param {Displayable} displayable
     * @private
     */
    _addDisplayable: function (nodeName, displayable) {
        if (this._displayableMap[nodeName] === undefined) {
            this._displayableMap[nodeName] = [];
        }

        displayable.once("beforeDestroy", this._onChildDestroy, this);

        this._displayableMap[nodeName].push(displayable);
    },

    /**
     * @param {String} nodeName
     * @param {Displayable} displayable
     * @private
     */
    _removeDisplayable: function (nodeName, displayable) {
        displayable.removeListener("destroy", this._onChildDestroy);
        this._displayableMap[nodeName] = _(this._displayableMap[nodeName]).filter(function filterIterator(nodeNameDisplayable) {
            return displayable !== nodeNameDisplayable;
        });
    },

    /**
     * Gets execute when a child is destroyed.
     *
     * @param {DestroyEvent} event
     * @private
     */
    _onChildDestroy: function (event) {
        var displayable = event.target,
            nodeName = displayable.node.parentNode.getAttribute("data-node");

        this._removeDisplayable(nodeName, displayable);
    }

});

/**
 * @class BeforeShowEvent
 * @extends Event
 */
var BeforeShowEvent = Event.extend("BeforeShowEvent");

/**
 * @class ShowEvent
 * @extends Event
 */
var ShowEvent = Event.extend("ShowEvent");

/**
 * @class BeforeHideEvent
 * @extends Event
 */
var BeforeHideEvent = Event.extend("BeforeHideEvent");

/**
 * @class HideEvent
 * @extends Event
 */
var HideEvent = Event.extend("HideEvent");

/**
 * @class BeforeDestroyEvent
 * @extends Event
 */
var BeforeDestroyEvent = Event.extend("BeforeDestroyEvent");

/**
 * @class DestroyEvent
 * @extends Event
 */
var DestroyEvent = Event.extend("DestroyEvent");

/**
 * @event BeforeDisposeEvent
 * @extends Event
 */
var BeforeDisposeEvent = Event.extend("BeforeDisposeEvent");

/**
 * @event DisposeEvent
 * @extends Event
 */
var DisposeEvent = Event.extend("DisposeEvent");

/**
 * @typedef {Object.<String, Function>}
 */
var EventMap;

/**
 * @type {Object}
 */
var Appender = {
    /**
     * Appends the given display object at the passed nodeName
     *
     * @param {String} nodeName
     * @return {Displayable}
     */
    at: function (nodeName) {
        var context = Appender.context,
            self = context.self,
            displayable = context.target,
            prepend = context.prepend,
            displayableParentNode,
            displayableNode;

        if (!self._isInNodeMap(nodeName)) {
            throw new Error(
                "(alamid) Can not create node at '" + nodeName + "'. '" +
                    nodeName + "' is not a child node."
            );
        }

        displayable.emit("beforeAdd");
        //Get node where given childView should be placed...
        displayableParentNode = self._nodeMap[nodeName];
        displayableNode = displayable.node;
        //and append or prepend it.
        if (prepend === true) {
            displayableParentNode.insertBefore(displayableNode, displayableParentNode.firstChild);
        } else {
            displayableParentNode.appendChild(displayableNode);
        }

        //Register Displayables for destroy() and dispose()
        self._addDisplayable(nodeName, displayable);

        displayable.emit("add");

        return self;
    },

    context: {}
};

module.exports = Displayable;