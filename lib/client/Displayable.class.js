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
     * @type {Array}
     * @private
     */
    _children: null,

    /**
     * @param {String=} template (default = "<div></div>")
     * @constructor
     */
    constructor: function (template) {
        var self = this;

        if (template === undefined) {
            template = this.template;
        }
        if (value(template).notTypeOf(String)) {
            throw new TypeError("(alamid) Cannot create Displayable: Expected a string as template, instead saw '" + template + "'");
        }

        this._super();

        this.template = template;
        this._nodeMap = {};
        this._children = [];

        if (value(this.events).typeOf(Object)) {
            this._addNodeEvents(this.events);
        }
        if (value(this.plugins).typeOf(Array)) {
            _(this.plugins).each(function addPlugins(plugin) {
                self.plugin(plugin);
            });
        }

        this._initTemplate(template);
        this._initNodeMap();

        this.emit("create", new CreateEvent(this));
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
        return domAdapter(this.node).hasClass(this.cssClassHide) === false;
    },

    /**
     * @return {Displayable}
     */
    show: function () {
        if (this.isVisible()) {
            return this;
        }

        domAdapter(this.node).removeClass(this.cssClassHide);
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

        domAdapter(this.node).addClass(this.cssClassHide);
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
    unhinge: function () {

        //if (this.parent) {
            domAdapter(this.node).destroy();
            this.parent = null;
            this.emit("unhinge", new UnhingeEvent(this));
        //}

        return this;
    },

    /**
     * Removes all DOM events and event listeners and cleans up references.
     */
    dispose: function () {

        if (!this._nodeMap) {
            return;
        }

        this.unhinge();

        _(this._nodeMap).each(function disposeNode(node) {
            domAdapter(node).off();
        });
        _(this._children).each(function disposeChildren(displayables) {
            displayables.dispose();
        });
        this.node = null;
        this._nodeMap = null;
        this._children = null;

        this.emit("dispose", new DisposeEvent(this));

        this.removeAllListeners();
    },

    /**
     * @param {String} template
     * @private
     */
    _initTemplate: function (template) {
        var incubatorNode = document.createElement("div");

        incubatorNode.innerHTML = template;

        if (incubatorNode.childNodes.length > 1) {
            throw new Error("(alamid) Error: Templates must contain only one parent node, " +
                "but template of '" + this.constructor.name + "' contains " + incubatorNode.childNodes.length + ".");
        }

        this.node = incubatorNode.removeChild(incubatorNode.firstChild);
    },

    /**
     * Looks up for nodes which were defined with data-node-attribute and adds them to nodeMap.
     * @private
     */
    _initNodeMap: function () {
        var nodes = domAdapter(this.node).find("[data-node]"),
            self = this;

        _(nodes).each(function addNodeToNodeMap(node) {
            self._nodeMap[node.getAttribute("data-node")] = node;
        });
    },

    /**
     * Gets executed when a child is destroyed.
     *
     * @param {DestroyEvent} event
     * @private
     */
    _onChildDestroy: function (event) {
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
     * Throws no error if the node name is not in the nodeMap
     *
     * @param {Object.<String, Function|String>} eventMap
     * @param {String} nodeName
     * @private
     */
    _addEventsToSingleNode: function (eventMap, nodeName) {
        var node,
            self = this;

        if (this._nodeMap[nodeName]) {
            node = this._nodeMap[nodeName];
            _(eventMap).each(function attachEventsIterator(listener, event) {
                if (value(listener).typeOf(String)) {
                    listener = self[listener] = self[listener].bind(self);
                }

                domAdapter(node).on(event, listener);
            });
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
 * @class UnhingeEvent
 * @extends Event
 */
var UnhingeEvent = Event.extend("UnhingeEvent");

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

        if (!self._nodeMap[nodeName]) {
            throw new Error(
                "(alamid) Can not add child at '" + nodeName + "': '" +
                    nodeName + "' is not in the node map."
            );
        }

        if (displayable.isChild()) {
            displayable.unhinge();
        }

        displayableParentNode = self._nodeMap[nodeName];
        displayableNode = displayable.node;
        if (prepend === true) {
            displayableParentNode.insertBefore(displayableNode, displayableParentNode.firstChild);
        } else {
            displayableParentNode.appendChild(displayableNode);
        }

        displayable.once("unhinge", self._onChildDestroy, self);
        self._children.push(displayable);

        return self;
    },

    context: {}
};

module.exports = Displayable;