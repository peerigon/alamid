var Extends = require('./Model.class.js');

var model = {
    name: "John Wayne",
    age: 45,
    kills: Number
};

var Class = {
    "init": function() {
        this.Super(__filename, model);
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
};