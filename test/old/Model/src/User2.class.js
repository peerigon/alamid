var Extends = require('./Model.class.js');

var model = {
    name: String,
    born: Date,
    age: null
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