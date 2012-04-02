var prepareLinks = require('./prepareLinks'),
    domAdapter = require('./domAdapter');

var Wrapper;

var Extends = require('./EventEmitter.class.js');
var Class = {
    "init": function init() {
        if (!Wrapper) {
            Wrapper = document.createElement('div');
        }
    },
    "_currentDisplayState": "init", // can be init, create, display, hide, destroy
    "_nodeMap": {},
    "__createNodeMap": function __createNodeMap(node) {
        var nodeMap,
            nodeName,
            nodeElement,
            i;

        nodeMap = domAdapter.node(node);
        for (i = 0; i < nodeMap.length; i++) {
            nodeElement = nodeMap[i];
            nodeElement.owner = this.Instance;
            nodeName = nodeElement.getAttribute('data-node');
            this._nodeMap[nodeName] = nodeElement;
        }
    },
    "getCurrentDisplayState": function () {
        return this._currentDisplayState;
    },
    "create": function create(parentNode) {
        var node;

        if (!this.template) {
            throw new Error("Cannot create DisplayObject. You haven't set a template for it.");
        }
        if (this.parentNode) {
            this.destroy();
        }
        this.parentNode = parentNode;
        Wrapper.innerHTML = this.template;
        node = Wrapper.firstChild;
        node.displayObject = this.Instance;
        this.node = node;
        domAdapter.addClass(node, 'alamid-hide');
        parentNode.appendChild(node);
        this.__createNodeMap(parentNode);
        prepareLinks(node);
        this.Super.emit('create');
        this._currentDisplayState = "create";
    },
    "display": function display() {
        this.Super.emit('display');
        domAdapter.removeClass(this.node, 'alamid-hide');
        this._currentDisplayState = "display";
    },
    "hide": function hide() {
        this.Super.emit('hide');
        domAdapter.addClass(this.node, 'alamid-hide');
        this._currentDisplayState = "hide";
    },
    "destroy": function destroy() {
        var key,
            node,
            firstChild,
            nodeMap = this._nodeMap;

        this.Super.emit('destroy');
        for (key in nodeMap) {
            if (nodeMap.hasOwnProperty(key)) {
                node = this._nodeMap[key];
                if (node) {
                    firstChild = node.firstChild;
                    if (firstChild && firstChild.owner) {
                        if (typeof firstChild.owner.destroy === "function") {
                            firstChild.owner.destroy();
                        }
                        if (typeof firstChild.owner.dispose === "function") {
                            firstChild.owner.dispose();
                        }
                    }
                    node.owner = null;
                    domAdapter.off(node);
                }
            }
        }

        this._nodeMap = {};
        this.node.displayObject = null;
        domAdapter.destroy(this.node);
        this.node = null;
        this.parentNode = null;
        this._currentDisplayState = "destroy";
    },
    "dispose": function () {
        if (this.parentNode) {
            this.destroy();
        }
        this.Super.emit('dispose');
        this.Super.removeAllListeners();
    },
    "toggleDisplay": function () {
        var currentDisplayState = this._currentDisplayState;

        if (currentDisplayState === "display") {
            this.hide();
        } else if (currentDisplayState === "hide" || currentDisplayState === "create") {
            this.display();
        } else {
            throw new Error("Cannot toggleDisplay: The display object doesn't seem to be in the DOM.");
        }
    },
    "template": "",
    "parentNode": null,
    "node": null
};