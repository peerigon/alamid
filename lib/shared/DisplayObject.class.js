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
    "create": function create(parentNode) {
        var node;

        if (typeof this.template !== "string") {
            throw new Error("Cannot create DisplayObject. You haven't set a template for it.");
        }
        this.parentNode = parentNode;
        Wrapper.innerHTML = this.template;
        node = Wrapper.firstChild;
        node.displayObject = this.Instance;
        this.node = node;
        domAdapter.addClass(node, 'hide');
        parentNode.appendChild(node);
        this.__createNodeMap(parentNode);
        prepareLinks(node);
        this.onCreate();
    },
    "display": function display() {
        domAdapter.removeClass(this.node, 'hide');
        this.onDisplay();
    },
    "destroy": function destroy() {
        var key,
            node;

        this.onDestroy();
        for (key in this._nodeMap) {
            node = this._nodeMap[key];
            if (node) {
                node.owner = null;
            }
        }

        this._nodeMap = {};
        this.node.displayObject = null;
        domAdapter.destroy(this.node);
        this.node = null;
        this.parentNode = null;
    },
    "template": "",
    "parentNode": null,
    "node": null,
    "?onCreate": Function,
    "?onDisplay": Function,
    "?onDestroy": Function
};