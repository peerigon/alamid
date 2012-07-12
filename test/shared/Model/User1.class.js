
var Class = require("nodeclass").Class;
var Model = require('../../../lib/shared/Model.class.js');

var model = {
    name: "John Wayne",
    age: 45,
    kills: Number
};

var User1 = new Class({
    Extends : Model,
    "init": function() {
        this.Super(__filename, model);
        this.Super._setDefaults(model);
    },
    "getService": function() {
        return null;
    },
    "getValidator": function() {
        return null;
    },
    "accept": function() {
        this.Super.acceptCurrentState();
    }
});

module.exports = User1;