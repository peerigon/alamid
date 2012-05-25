var Extends = require('./DisplayObject.class.js');
var Class = {
    "_model": null,
    "bind": function bind(model) {
        if (this._model) {
            this.unbind();
        }
        this._model = model;
        model.on('change', this.onModelChange);
        if (this.Super.getNode()) {
            this.onModelChange();
        }
    },
    "unbind": function unbind() {
        var model = this._model;

        if (model) {
            model.removeListener('change', this.onModelChange);
            this._model = null;
        }
    },
    "create": function create(parentNode) {
        this.Super.create(parentNode);
        if (this._model) {
            this.onModelChange();
        }
    },
    "draw": function draw(data) {
        var nodeMap = this.Super.getNodeMap(),
            model = this._model,
            node,
            nodeName,
            property;

        if (!data) {
            if (model) {
                data = model.escape();
            } else {
                throw new Error("No data given for drawing the view");
            }
        }
        for (nodeName in nodeMap) {
            if (nodeMap.hasOwnProperty(nodeName)) {
                property = data[nodeName];
                if (property === undefined) {   // IF TRUE: Unknown property, there is nothing to render
                    continue;
                }
                if (property === null) {    // IF TRUE: The property is known, but there is no data to render
                    property = "";
                }
                node = nodeMap[nodeName];
                if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
                    node.value = property;
                } else {
                    node.innerHTML = property;
                }
            }
        }
    },
    "dispose": function dispose() {
        this.unbind();
        this.Super.dispose();
    },
    "onModelChange": function onModelChange() {
        this.Super.emit("modelchange");
    }
};