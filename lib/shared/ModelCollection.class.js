var Extends = require('./EventEmitter.class.js');

var Class = {
    "init": function init(modelClass) {
        if (!modelClass) {
            throw new Error('You havent passed a model class.A model collection needs a class that describes the '
                + 'the contained models')
        }
    },
    "__modelClass": null,
    "getModelClass": function getModelClass() {

    },
    "_elements": [],
    "muted": false,
    "pop": function pop() {
        if (!this.muted) {
            this.Super.emit('change');
        }
    }
};