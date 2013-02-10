"use strict";

var value = require("value"),
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Event = require("../shared/Event.class.js"),
    Plugins = require("../shared/Plugins.mixin.js"),
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
     * @type {Node}
     */
    root: null,

    /**
     * @type {Object}
     */
    nodes: null,

    /**
     * the css-class to be used for hide
     * @type {String}
     */
    cssClassHide : "hide",

    /**
     * @type {Array}
     * @private
     */
    _children: null,

    /**
     * @param {Node|String=} node (default = "<div></div>")
     * @constructor
     */
    constructor: function (node) {

        if (node === undefined) {
            node = this.template || document.createElement("div");
        }
        if (value(node).notTypeOf(Node) && value(node).notTypeOf(String)) {
            throw new TypeError("(alamid) Cannot create Displayable: Expected a string or node as template, instead saw '" + node + "'");
        }

        this._super();

        this.nodes = {};
        this._children = [];

        if (value(node).typeOf(String)) {
            node = this._initTemplate(node);
        }
        this.root = node;
        this._initNodes();

        if (value(this.events).typeOf(Object)) {
            this._addNodeEvents(this.events);
        }

        this.emit("create", new CreateEvent(this));
    },

    /**
     * @return {Boolean}
     */
    isChild: function () {
        return Boolean(this.root) && this.root.parentNode !== null;
    },

    /**
     * @return {Boolean}
     */
    isVisible: function () {
        return domAdapter(this.root).hasClass(this.cssClassHide) === false;
    },

    /**
     * @return {Displayable}
     */
    show: function () {
        if (this.isVisible()) {
            return this;
        }

        domAdapter(this.root).removeClass(this.cssClassHide);
        this.emit("show", new ShowEvent(this));

        return this;
    },

    /**
     * @return {Displayable}
     */
    hide: function () {
        if (this.isVisible() === false) {
            return this;
        }

        domAdapter(this.root).addClass(this.cssClassHide);
        this.emit("hide", new HideEvent(this));

        return this;
    },

    /**
     * @param state {Boolean} force show with true
     * @return {Displayable}
     */
    toggle : function (state) {
        state = arguments.length === 0 ? !this.isVisible() : state;

        if (state === true) {
            return this.show();
        } else {
            return this.hide();
        }
    },

    /**
     * @return {Displayable}
     */
    detach: function () {

        if (this.root.parentNode) {
            domAdapter(this.root).detach();
            this.emit("detach", new DetachEvent(this));
        }

        return this;
    },

    /**
     * Removes all DOM events and event listeners and cleans up references.
     */
    dispose: function () {

        if (!this.nodes) {
            return;
        }

        this.detach();

        _(this.nodes).each(function disposeNode(node) {
            domAdapter(node).off();
        });
        _(this._children).each(function disposeChildren(displayables) {
            displayables.dispose();
        });
        this.root = null;
        this.nodes = null;
        this._children = null;

        this.emit("dispose", new DisposeEvent(this));

        this.removeAllListeners();
    },

    find: function (query) {
        return domAdapter(this.root).find(query);
    },

    /**
     * How to use: this.append(new Displayable()).at("nodeName").
     *
     * @param {Displayable} displayable
     * @return {Object}
     */
    append: function (displayable) {
        return this._addChild(displayable, false);
    },

    /**
     * How to use: this.prepend(new Displayable()).at("nodeName").
     *
     * @param {Displayable} displayable
     * @return {Object}
     */
    prepend: function (displayable) {
        return this._addChild(displayable, true);
    },

    /**
     * @param {Displayable} displayable
     * @param {Boolean} prepend
     * @return {Object}
     * @private
     */
    _addChild: function (displayable, prepend) {

        if (value(displayable).notTypeOf(Displayable)) {
            throw new TypeError("(alamid) Cannot add child: The passed child '" + displayable + "' is not type of Displayable.");
        }

        Appender.context.self = this;
        Appender.context.target = displayable;
        Appender.context.prepend = prepend;

        return Appender;
    },

    /**
     * @param {String} template
     * @return {Node} root
     * @private
     */
    _initTemplate: function (template) {
        var incubatorNode = document.createElement("div");

        incubatorNode.innerHTML = template;

        if (incubatorNode.childNodes.length > 1) {
            throw new Error("(alamid) Error: Templates must contain only one parent node, " +
                "but template of '" + this.constructor.name + "' contains " + incubatorNode.childNodes.length + ".");
        }

        return incubatorNode.removeChild(incubatorNode.firstChild);
    },

    /**
     * Looks up for nodes which were defined with data-node-attribute and adds them to nodes.
     * @private
     */
    _initNodes: function () {
        var nodes = domAdapter(this.root).find("[data-node]"),
            self = this;

        _(nodes).each(function addToNodes(node) {
            self.nodes[node.getAttribute("data-node")] = node;
        });
    },

    /**
     * Gets executed when a child is detached.
     *
     * @param {DetachEvent} event
     * @private
     */
    _onChildDetach: function (event) {
        this._children = _(this._children).without(event.target);
    },

    /**
     * @param {Object.<String, EventMap>} nodeEventMap
     */
    _addNodeEvents: function (nodeEventMap) {
        _(nodeEventMap).each(this._addEventsToSingleNode, this);
    },

    /**
     * Adds the given events to a particular node.
     * Throws no error if the node name is not in the nodes
     *
     * @param {Object.<String, Function|String>} eventMap
     * @param {String} nodeName
     * @private
     */
    _addEventsToSingleNode: function (eventMap, nodeName) {
        var node,
            self = this;

        if (this.nodes[nodeName]) {
            node = this.nodes[nodeName];
            _(eventMap).each(function attachEventsIterator(listener, event) {
                if (value(listener).typeOf(String)) {
                    listener = self[listener] = self[listener].bind(self);
                }

                domAdapter(node).on(event, listener);
            });
        }
    }

});

/**
 * @class CreateEvent
 * @extends Event
 */
var CreateEvent = Event.extend("CreateEvent");

/**
 * @class ShowEvent
 * @extends Event
 */
var ShowEvent = Event.extend("ShowEvent");

/**
 * @class HideEvent
 * @extends Event
 */
var HideEvent = Event.extend("HideEvent");

/**
 * @class DetachEvent
 * @extends Event
 */
var DetachEvent = Event.extend("DetachEvent");

/**
 * @class DisposeEvent
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

        if (!self.nodes[nodeName]) {
            throw new Error(
                "(alamid) Can not add child at '" + nodeName + "': '" +
                    nodeName + "' is not in the node map."
            );
        }

        if (displayable.isChild()) {
            displayable.detach();
        }

        displayableParentNode = self.nodes[nodeName];
        displayableNode = displayable.root;
        if (prepend === true) {
            displayableParentNode.insertBefore(displayableNode, displayableParentNode.firstChild);
        } else {
            displayableParentNode.appendChild(displayableNode);
        }

        displayable.once("detach", self._onChildDetach, self);
        self._children.push(displayable);

        return self;
    },

    context: {}
};

module.exports = Displayable;