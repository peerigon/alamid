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
     * the css-class to be used for hide
     * @type {String}
     */
    cssClassHide : "hide",

    /**
     * @type {Node}
     * @private
     */
    _root: null,

    /**
     * @type {Displayable}
     * @private
     */
    _parent: null,

    /**
     * @type {Object}
     * @private
     */
    _nodes: null,

    /**
     * @type {Array}
     * @private
     */
    _children: null,

    /**
     * @param {Node|String=} node (default = "<div data-node="root"></div>")
     * @constructor
     */
    constructor: function (node) {
        var self = this,
            domEvents = this.domEvents;

        if (value(node).typeOf(Node)) {
            this._root = node;
        } else if (value(node).typeOf(String)) {
            this.template = node;
        } else if (node !== undefined) {
            throw new TypeError("(alamid) Cannot create Displayable: Expected a string or node as template, instead saw '" + node + "'");
        }

        this._super();
        this._children = [];
        initNodes(self);

        this.on("document", function onDocument() {
            _(self._children).each(function (child) {
                child.emit("document", new DocumentEvent(child));
            });
        });

        if (value(domEvents).typeOf(Object)) {
            addDomEvents(this, domEvents);
        }

        this.emit("create", new CreateEvent(this));
    },

    /**
     * @return {Boolean}
     */
    isVisible: function () {
        return domAdapter(this._root).hasClass(this.cssClassHide) === false;
    },

    /**
     * @return {Boolean}
     */
    isInDocument: function () {
        return this._root === document ||
            (this._parent !== null && this._parent.isInDocument());
    },

    /**
     * @return {Node}
     */
    getRoot: function () {
        return this._root;
    },

    /**
     * @return {Displayable}
     */
    getParent: function () {
        return this._parent;
    },

    /**
     * @return {Object}
     */
    getNodes: function () {
        return this._nodes;
    },

    /**
     * @return {Displayable}
     */
    show: function () {

        if (this.isVisible() === false) {
            domAdapter(this._root).removeClass(this.cssClassHide);
            this.emit("show", new ShowEvent(this));
        }

        return this;
    },

    /**
     * @return {Displayable}
     */
    hide: function () {

        if (this.isVisible()) {
            domAdapter(this._root).addClass(this.cssClassHide);
            this.emit("hide", new HideEvent(this));
        }

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

        if (this._root.parentNode) {
            domAdapter(this._root).detach();
            this._parent = null;
            this.emit("detach", new DetachEvent(this));
        }

        return this;
    },

    /**
     * Removes all DOM events and event listeners and cleans up references.
     */
    dispose: function () {
        var self = this;

        if (!this._nodes) {
            return;
        }

        this.detach();

        _(this._nodes).each(function disposeNode(node, name) {
            domAdapter(node).off();
            delete self._nodes[name];
        });
        _(this._children).each(function disposeChildren(displayables) {
            displayables.dispose();
        });
        this._root = null;
        this._nodes = null;
        this._children = null;

        this.emit("dispose", new DisposeEvent(this));

        this.removeAllListeners();
    },

    /**
     * Performs a css query on the root.
     *
     * @param {String} query
     * @return {NodeList}
     */
    find: function (query) {
        return domAdapter(this._root).find(query);
    },

    /**
     * How to use: this.append(new Displayable()).at("nodeName").
     *
     * @param {Displayable} displayable
     * @return {Appender}
     */
    append: function (displayable) {
        return addChild(this, displayable, false);
    },

    /**
     * How to use: this.prepend(new Displayable()).at("nodeName").
     *
     * @param {Displayable} displayable
     * @return {Appender}
     */
    prepend: function (displayable) {
        return addChild(this, displayable, true);
    }

});

/**
 * @type {Object}
 */
var Appender = {

    context: {},

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
            parentNode,
            root;

        if (!self._nodes[nodeName]) {
            throw new Error("(alamid) Can not add child at '" + nodeName + "': '" + nodeName + "' is not part of the nodes-object.");
        }

        if (displayable.getParent()) {
            displayable.detach();
        }

        parentNode = self._nodes[nodeName];
        root = displayable.getRoot();
        if (prepend === true) {
            parentNode.insertBefore(root, parentNode.firstChild);
        } else {
            parentNode.appendChild(root);
        }
        displayable._parent = self;
        self._children.push(displayable);

        displayable.once("detach", onChildDetach, self);
        if (self.isInDocument()) {
            displayable.emit("document", new DocumentEvent(displayable));
        }
        self.emit("child", new ChildEvent(self, displayable));

        return self;
    }
};

/**
 * @param {Displayable} self
 * @param {Object} events
 */
function addDomEvents(self, events) {
    _(events).each(function addEventsToSingleNode(eventMap, nodeName) {
        var node;

        if (self._nodes[nodeName]) {
            node = self._nodes[nodeName];
            _(eventMap).each(function addEventListener(listener, event) {
                if (value(listener).typeOf(String)) {
                    listener = self[listener] = self[listener].bind(self);
                }
                domAdapter(node).on(event, listener);
            });
        }
    });
}

/**
 * @param {Displayable} self
 */
function initNodes(self) {
    var root = self.getRoot(),
        template = self.template || '<div data-node="root"></div>',
        incubatorNode = document.createElement("div"),
        i,
        node,
        nodes,
        domNodes;

    if (!root) {
        incubatorNode.innerHTML = template;
        if (incubatorNode.childNodes.length > 1) {
            throw new Error("(alamid) Error: Templates must contain only one parent node, but template of '" + this.constructor.name + "' contains " + incubatorNode.childNodes.length);
        }
        root = incubatorNode.removeChild(incubatorNode.firstChild);
    }

    if (root) {
        nodes = {};
        domNodes = domAdapter(root).find("[data-node]");
        // avoiding function-loop because it may produce a memory leak in combination with dom nodes
        for (i = 0; i < domNodes.length; i++) {
            node = domNodes[i];
            nodes[node.getAttribute("data-node")] = node;
        }
        self._nodes = nodes;
        self._root = root;
    }
}

/**
* @param {Displayable} self
* @param {Displayable} displayable
* @param {Boolean} prepend
* @return {Appender}
* @private
*/
function addChild(self, displayable, prepend) {
    if (value(displayable).notTypeOf(Displayable)) {
        throw new TypeError("(alamid) Cannot add child: The passed child '" + displayable + "' is not type of Displayable.");
    }

    Appender.context.self = self;
    Appender.context.target = displayable;
    Appender.context.prepend = prepend;

    return Appender;
}


/**
 * Gets executed when a child is detached.
 *
 * @param {DetachEvent} event
 * @private
 */
function onChildDetach(event) {
    var children = this._children,
        detached = event.target,
        i;

    // we don't use underscore here for better performance
    // because this function gets called on dispose() for every child
    for (i = 0; i < children.length; i++) {
        if (children[i] === detached) {
            children.splice(i, 1);
            return;
        }
    }
}

/**
 * @class CreateEvent
 * @extends Event
 */
var CreateEvent = Event.extend("CreateEvent", {

    /**
     * @type {String}
     */
    name: "CreateEvent"

});

/**
 * @class ShowEvent
 * @extends Event
 */
var ShowEvent = Event.extend("ShowEvent", {

    /**
     * @type {String}
     */
    name: "ShowEvent"

});

/**
 * @class HideEvent
 * @extends Event
 */
var HideEvent = Event.extend("HideEvent", {

    /**
     * @type {String}
     */
    name: "HideEvent"

});

/**
 * @class DetachEvent
 * @extends Event
 */
var DetachEvent = Event.extend("DetachEvent", {

    /**
     * @type {String}
     */
    name: "DetachEvent"

});

/**
 * @class DisposeEvent
 * @extends Event
 */
var DisposeEvent = Event.extend("DisposeEvent", {

    /**
     * @type {String}
     */
    name: "DisposeEvent"

});

/**
 * @class ChildEvent
 * @extends Event
 */
var ChildEvent = Event.extend("ChildEvent", {

    /**
     * @type {String}
     */
    name: "ChildEvent",

    /**
     * @type {Displayable}
     */
    child: null,

    constructor: function (target, child) {
        this._super(target);
        this.child = child;
    }
});

/**
 * @class DocumentEvent
 * @extends Event
 */
var DocumentEvent = Event.extend("DocumentEvent", {

    /**
     * @type {String}
     */
    name: "DocumentEvent"

});

module.exports = Displayable;