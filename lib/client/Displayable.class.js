"use strict";

var value = require("value"),
    Base = require("../shared/Base.class.js"),
    Event = require("../shared/Event.class.js"),
    domAdapter = require("./helpers/domAdapter.js");

/**
 * Represents a section of the DOM and provides various methods to manipulate it.
 *
 * @class Displayable
 * @extends Base
 */
var Displayable = Base.extend("Displayable", {

    /**
     * The css-class to be used for hide
     * @type {String}
     */
    cssClassHide : "hide",

    /**
     * @type {String}
     */
    template: '<div data-node="root"></div>',

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
     * @param {Node|String=} node
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
            throw new TypeError("(alamid) Cannot create Displayable: Expected a string or node as template, instead saw '" + typeof node + "'");
        }

        this._super();
        this._children = [];

        initNodes(self);

        if (value(domEvents).typeOf(Object)) {
            addDomEvents(this, domEvents);
        }
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
        var parent = this._parent,
            node = this._root;

        // if there is a parent, it's faster to ask that parent
        if (parent) {
            return parent.isInDocument();
        }

        while (true) {
            if (node === document) {
                return true;
            } else if (!node) {
                return false;
            }
            node = node.parentNode;
        }
    },

    /**
     * @return {Node}
     */
    getRoot: function () {
        return this._root? domAdapter.$(this._root) : null;
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
    getNode: function (name) {
        var node;

        if (value(name).notTypeOf(String)) {
            throw new TypeError("(alamid) Cannot get node: The node name must be a string, instead saw typeof '" + typeof name + "'");
        }
        node = this._nodes && this._nodes[name];

        return node? domAdapter.$(node) : null;
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
    toggle: function (state) {

        state = arguments.length === 0 ? !this.isVisible() : Boolean(state);
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
        var root = this._root;

        if (root.parentNode) {
            root.parentNode.removeChild(root);
            this._parent = null;
            this.emit("detach", new DetachEvent(this));
        }

        return this;
    },

    /**
     * Removes all DOM events and event listeners and cleans up references.
     */
    dispose: function () {
        var children,
            i,
            child,
            node,
            key;

        if (!this._nodes) {
            return;
        }

        this.detach();

        for (key in this._nodes) {
            if (this._nodes.hasOwnProperty(key)) {
                node = this._nodes[key];
                domAdapter(node).off();
                delete this._nodes[key];
            }
        }
        node = null;
        this.getRoot().off();

        // we need a copy of this._children because it will be modified by calling child.dispose();
        children = this._children.slice(0);
        for (i = 0; i < children.length; i++) {
            child = children[i];
            child.dispose();
        }

        this._root = null;
        this._nodes = null;
        this._children = null;

        this._super();
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
    },

    /**
     * @see Base#emit()
     */
    emit: function () {
        var eventName = arguments[0],
            i,
            child,
            returned;

        returned = this._super.apply(this, arguments);
        if (eventName === "document") {
            // proxy document event to all children
            for (i = 0; i < this._children.length; i++) {
                child = this._children[i];
                child.emit("document", new DocumentEvent(child));
            }
        }

        return returned;
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
        root = displayable._root;
        if (prepend === true) {
            parentNode.insertBefore(root, parentNode.firstChild);
        } else {
            parentNode.appendChild(root);
        }
        displayable._parent = self;
        self._children.push(displayable);

        displayable.once("detach", onChildDetach.bind(self));
        if (self.isInDocument()) {
            displayable.emit("document", new DocumentEvent(displayable));
        }
        self.emit("child", new ChildEvent(self, displayable));

        return self;
    }
};

/**
 * @param {Displayable} self
 * @param {Object} nodes
 */
function addDomEvents(self, nodes) {
    var nodeName,
        eventMap,
        eventName,
        node,
        listener;

    for (nodeName in nodes) {
        if (nodes.hasOwnProperty(nodeName)) {
            eventMap = nodes[nodeName];

            if (value(eventMap).notTypeOf(Object)) {
                throw new TypeError("(alamid) Cannot add dom events: The event map is not an object, instead saw typeof '" + typeof eventMap + "'");
            }

            if (self._nodes[nodeName]) {
                node = self._nodes[nodeName];

                for (eventName in eventMap) {
                    if (eventMap.hasOwnProperty(eventName)) {
                        listener = eventMap[eventName];
                        if (value(listener).typeOf(String)) {
                            listener = self[listener] = self[listener].bind(self);
                        }
                        domAdapter(node).on(eventName, listener);
                    }
                }
            }

        }
    }
}

/**
 * Don't use function scopes inside this function as it may produce memory leaks
 *
 * @param {Displayable} self
 * @private
 */
function initNodes(self) {
    var root = self._root,
        template = self.template,
        incubatorNode = document.createElement("div"),
        children,
        i,
        node,
        nodes,
        domNodes;

    if (!root) {
        incubatorNode.innerHTML = template;
        children = incubatorNode.children;
        for (i = 0; i < children.length; i++) {
            node = children[i];
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (root) {
                    throw new Error("(alamid) Error: Template of '" + self.Class.name + "' has more than one root node.");
                }
                root = node;
            }
        }
        if (!root) {
            throw new Error("(alamid) Error: Could not find a root node in template of '" + self.Class.name + "'.");
        }
        incubatorNode.removeChild(root);
    }

    nodes = {};
    domNodes = domAdapter(root).find("[data-node]");
    for (i = 0; i < domNodes.length; i++) {
        node = domNodes[i];
        nodes[node.getAttribute("data-node")] = node;
    }
    self._nodes = nodes;
    self._root = root;
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

    for (i = 0; i < children.length; i++) {
        if (children[i] === detached) {
            children.splice(i, 1);
            return;
        }
    }
}

/**
 * @class ShowEvent
 * @extends Event
 */
var ShowEvent = Event.extend("ShowEvent", {
    name: "ShowEvent"
});

/**
 * @class HideEvent
 * @extends Event
 */
var HideEvent = Event.extend("HideEvent", {
    name: "HideEvent"
});

/**
 * @class DetachEvent
 * @extends Event
 */
var DetachEvent = Event.extend("DetachEvent", {
    name: "DetachEvent"
});

/**
 * @class ChildEvent
 * @extends Event
 */
var ChildEvent = Event.extend("ChildEvent", {
    name: "ChildEvent",
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
    name: "DocumentEvent"
});

module.exports = Displayable;