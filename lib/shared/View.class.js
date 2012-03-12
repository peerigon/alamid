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
            node,
            nodeName,
            property;

        if (!data && this._model) {
            data = this._model.escape();
        }
        for (nodeName in nodeMap) {
            property = data[nodeName];
            if (property === null || property === undefined) {
                property = "";  // If there is no value set, we display an empty string
            }
            node = nodeMap[nodeName];
            if (node.tagName === 'INPUT') {
                nodeMap[nodeName].value = property;
            } else {
                nodeMap[nodeName].innerHTML = property;
            }
        }
    },
    "destroy": function destroy() {
        this.unbind();
        this.Super.destroy();
    },
    "?onModelChange": Function,
    "?onCreate": Function,
    "?onDisplay": Function,
    "?onDestroy": Function
};